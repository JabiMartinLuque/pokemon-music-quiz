import { supabase } from './supabase-config.js';

export class StatsManager {
    constructor() {
        this.currentStats = null;
    }

    // Obtener estadísticas del usuario
    async getUserStats(userId) {
        try {
            const { data, error } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error('Error obteniendo estadísticas:', error);
                return null;
            }

            // Si no existe, crear registro inicial
            if (!data) {
                return await this.createInitialStats(userId);
            }

            this.currentStats = data;
            return data;
        } catch (error) {
            console.error('Error en getUserStats:', error);
            // Fallback a localStorage
            return this.getStatsFromLocalStorage(userId);
        }
    }

    // Crear estadísticas iniciales para un nuevo usuario
    async createInitialStats(userId) {
        try {
            const initialStats = {
                user_id: userId,
                total_plays: 0,
                correct_answers: 0,
                best_streak: 0
            };

            const { data, error } = await supabase
                .from('user_stats')
                .insert([initialStats])
                .select()
                .single();

            if (error) {
                console.error('Error creando estadísticas iniciales:', error);
                // Guardar en localStorage como fallback
                this.saveStatsToLocalStorage(userId, initialStats);
                return initialStats;
            }

            this.currentStats = data;
            return data;
        } catch (error) {
            console.error('Error en createInitialStats:', error);
            const fallbackStats = {
                user_id: userId,
                total_plays: 0,
                correct_answers: 0,
                best_streak: 0
            };
            this.saveStatsToLocalStorage(userId, fallbackStats);
            return fallbackStats;
        }
    }

    // Actualizar estadísticas después de una partida
    async updateStats(userId, gameResult) {
        try {
            const currentStats = await this.getUserStats(userId);
            if (!currentStats) return null;

            const updatedStats = {
                total_plays: (currentStats.total_plays || 0) + 1,
                correct_answers: (currentStats.correct_answers || 0) + (gameResult.correctAnswers || 0),
                best_streak: Math.max(currentStats.best_streak || 0, gameResult.bestStreak || 0)
            };

            const { data, error } = await supabase
                .from('user_stats')
                .update(updatedStats)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error actualizando estadísticas:', error);
                // Actualizar en localStorage como fallback
                const localStats = { ...currentStats, ...updatedStats };
                this.saveStatsToLocalStorage(userId, localStats);
                return localStats;
            }

            this.currentStats = data;
            return data;
        } catch (error) {
            console.error('Error en updateStats:', error);
            return null;
        }
    }

    // Incrementar racha actual (para uso en tiempo real)
    async updateStreak(userId, newStreak) {
        try {
            const currentStats = await this.getUserStats(userId);
            if (!currentStats) return null;

            // Solo actualizar si la nueva racha es mejor
            if (newStreak > (currentStats.best_streak || 0)) {
                const { data, error } = await supabase
                    .from('user_stats')
                    .update({ best_streak: newStreak })
                    .eq('user_id', userId)
                    .select()
                    .single();

                if (error) {
                    console.error('Error actualizando racha:', error);
                    // Actualizar en localStorage
                    const localStats = { ...currentStats, best_streak: newStreak };
                    this.saveStatsToLocalStorage(userId, localStats);
                    return localStats;
                }

                this.currentStats = data;
                return data;
            }

            return currentStats;
        } catch (error) {
            console.error('Error en updateStreak:', error);
            return null;
        }
    }

    // Obtener porcentaje de acierto
    getAccuracyPercentage(stats = this.currentStats) {
        if (!stats || !stats.total_plays || stats.total_plays === 0) return 0;
        return Math.round((stats.correct_answers / stats.total_plays) * 100);
    }

    // Obtener estadísticas formateadas para mostrar
    getFormattedStats(stats = this.currentStats) {
        if (!stats) return null;

        return {
            totalPlays: stats.total_plays || 0,
            correctAnswers: stats.correct_answers || 0,
            bestStreak: stats.best_streak || 0,
            accuracy: this.getAccuracyPercentage(stats)
        };
    }

    // Métodos de fallback para localStorage
    saveStatsToLocalStorage(userId, stats) {
        try {
            const key = `pokemon_quiz_stats_${userId}`;
            localStorage.setItem(key, JSON.stringify(stats));
        } catch (error) {
            console.error('Error guardando estadísticas en localStorage:', error);
        }
    }

    getStatsFromLocalStorage(userId) {
        try {
            const key = `pokemon_quiz_stats_${userId}`;
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error obteniendo estadísticas de localStorage:', error);
            return null;
        }
    }

    // Sincronizar estadísticas de localStorage a Supabase
    async syncStatsToSupabase(userId) {
        try {
            const localStats = this.getStatsFromLocalStorage(userId);
            if (!localStats) return null;

            const { data, error } = await supabase
                .from('user_stats')
                .upsert([localStats])
                .select()
                .single();

            if (error) {
                console.error('Error sincronizando estadísticas:', error);
                return null;
            }

            this.currentStats = data;
            return data;
        } catch (error) {
            console.error('Error en syncStatsToSupabase:', error);
            return null;
        }
    }
}