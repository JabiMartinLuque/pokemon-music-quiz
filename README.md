# Pokémon Music Quiz 🎵

Adivina las canciones de Pokémon de las 7 primeras generaciones.

## 🚀 Configuración Inicial

### 1. Clonar y configurar
```bash
git clone https://github.com/JabiMartinLuque/pokemon-music-quiz.git
cd pokemon-music-quiz
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Supabase
# VITE_SUPABASE_URL=tu_url_de_supabase
# VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 3. Iniciar servidor
```bash
python -m http.server 8000
```

Luego abre: `http://localhost:8000`

## 🔧 Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta las consultas SQL del archivo `database-setup.sql`
3. Copia tu URL y clave anónima al archivo `.env`

## 🎮 Qué incluye

- **780+ canciones** de Pokémon
- **Modo Normal**: Práctica libre
- **Daily Challenge**: Desafío diario
- **Sistema de rachas**: Cuenta días consecutivos
- **Responsive**: Funciona en móvil

## 🎯 Generaciones

Fire Red/Leaf Green • Heart Gold/Soul Silver • Ruby/Sapphire/Emerald • Diamond/Pearl/Platinum • Black/White • X/Y • Sun/Moon

## ⚠️ ¿Por qué servidor?

La app usa ES6 modules. Los navegadores los bloquean con `file://` pero funcionan con `http://`.
