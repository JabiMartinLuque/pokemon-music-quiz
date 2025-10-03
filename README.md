# Pokémon Music Quiz 🎵

## 🚀 Descripción
Quiz musical de Pokémon con sistema de streaks diarios y más de 780 canciones de 7 generaciones.

## 📁 Estructura Simplificada

```
pokimon_minijuego/
├── assests/
│   └── background.png    # Imagen de fondo
├── css/
│   ├── main.css         # Estilos base y layout
│   ├── components.css   # Componentes UI reutilizables  
│   └── daily.css        # Estilos específicos para daily challenge
├── js/
│   ├── app.js          # Clase principal de la aplicación
│   ├── data.js         # 780+ canciones de Pokémon (7 generaciones)
│   ├── quiz-engine.js  # Motor del quiz y lógica de juego
│   ├── router.js       # Enrutamiento simple
│   └── streak-manager.js # Sistema de streaks diarios
├── daily/
│   └── index.html      # Daily Challenge
├── index.html          # 🎯 PÁGINA PRINCIPAL (USAR ESTA)  
├── index-old.html      # Versión original (respaldo)
└── README.md           # Este archivo
```

## 🎮 Características

### Funciones Principales
- ✅ **Quiz Musical**: 780+ canciones de 7 generaciones de Pokémon
- ✅ **Modo Normal**: Práctica libre con tracks aleatorios
- ✅ **Daily Challenge**: Un desafío diario único por día
- ✅ **Sistema de Streaks**: Contador de días consecutivos
- ✅ **Navegación**: Enrutamiento entre modos (/ y /daily)
- ✅ **Responsive**: Diseño adaptable a móviles

### Generaciones Incluidas
1. **Gen 1**: Fire Red / Leaf Green
2. **Gen 2**: Heart Gold / Soul Silver  
3. **Gen 3**: Ruby / Sapphire / Emerald
4. **Gen 4**: Diamond / Pearl / Platinum
5. **Gen 5**: Black / White
6. **Gen 6**: X / Y
7. **Gen 7**: Sun / Moon

## � Cómo Usar

### Método 1: Servidor Local (RECOMENDADO)
```bash
# En la carpeta del proyecto
python -m http.server 8000

# Luego abrir en navegador:
http://localhost:8000
```

### Método 2: Extensión Live Server
1. Instalar "Live Server" en VS Code
2. Click derecho en `index.html` → "Open with Live Server"

### ⚠️ IMPORTANTE: ¿Por qué necesito servidor?
- La app usa **ES6 modules** (import/export)
- Los navegadores **bloquean** modules con `file://`
- El servidor convierte `file://` → `http://` ✅

## 🎮 Navegación
- **Página Principal**: `http://localhost:8000/` (Modo Normal)
- **Daily Challenge**: `http://localhost:8000/daily/` (Desafío Diario)

## 🛠️ Tecnologías Utilizadas

- **Vanilla JavaScript**: ES6 Modules, Classes
- **HTML5**: Audio API, LocalStorage
- **CSS3**: Grid, Flexbox, Glassmorphism
- **Vanilla JavaScript**: ES6+ modules, clases, localStorage
- **Web APIs**: History API para enrutamiento, localStorage para persistencia

## 🏗️ Arquitectura

### Módulos JavaScript

#### `app.js` - Aplicación Principal
```javascript
class PokemonMusicQuiz {
  // Orquesta toda la aplicación
  // Maneja el ciclo de vida y coordinación entre módulos
}
```

#### `quiz-engine.js` - Motor del Quiz
```javascript  
class QuizEngine {
  // Maneja la lógica del juego
  // Generación de preguntas y validación de respuestas
}
```

#### `streak-manager.js` - Sistema de Streaks
```javascript
class DailyStreakManager {
  // Persistencia con localStorage
  // Lógica de días consecutivos y recompensas
}
```

#### `router.js` - Enrutamiento
```javascript
class SimpleRouter {
  // Navegación sin dependencias externas
  // Manejo del History API
}
```

#### `data.js` - Base de Datos
```javascript
export const pokemonData = {
  // 780+ canciones organizadas por juego
  // Estructura consistente y escalable
}
```

## 🚀 Instalación y Uso

### Desarrollo Local
1. Clona o descarga el proyecto
2. Abre `test.html` para verificar funcionalidad
3. Usa `index-new.html` para la versión modular completa
4. Opcional: usa `daily/index.html` para acceso directo al daily challenge

### Producción
- Todos los archivos son estáticos
- Compatible con cualquier servidor web
- No requiere compilación ni dependencias

## 🔧 Desarrollo

### Estructura de Clases
```javascript
// Inicialización
const app = new PokemonMusicQuiz();
app.initialize();

// Acceso a submódulos
app.streakManager   // Gestión de streaks
app.quizEngine      // Lógica del quiz  
app.router          // Navegación
```

### Eventos Principales
- **nextTrack()**: Generar nueva pregunta (modo normal)
- **checkAnswer()**: Validar respuesta del usuario
- **switchMode()**: Cambiar entre normal/daily
- **completeDailyChallenge()**: Actualizar streak

### CSS Modular
- **main.css**: Base, typography, layout general
- **components.css**: Botones, navigation, quiz UI
- **daily.css**: Estilos específicos para challenges diarios

## 📊 Datos Técnicos

- **Total de canciones**: 780+
- **Juegos cubiertos**: 7 generaciones principales
- **Tamaño de datos**: ~50KB (estructura JSON)
- **Compatible**: Navegadores modernos con soporte ES6 modules
- **Performance**: Carga lazy de audio, optimizado para mobile

## 🐛 Debugging

### Herramientas de Desarrollo
```javascript
// En consola del navegador
window.app                    // Instancia principal
window.app.quizEngine        // Motor del quiz
window.app.streakManager     // Sistema de streaks
window.app.router           // Enrutador

// Verificar datos
console.log(window.app.quizEngine.pokemonData);
```

### Archivos de Prueba
- `test.html`: Página con debug y manejo de errores
- Logs en consola para seguimiento de flujo
- Manejo de errores con try/catch

## 🎯 Próximas Mejoras

- [ ] Sistema de puntuaciones
- [ ] Modo multijugador local
- [ ] Más generaciones (Gen 8, Gen 9)
- [ ] Sistema de achievements
- [ ] Compartir resultados diarios
- [ ] PWA para instalación móvil

## 📝 Notas de Desarrollo

### Migración de Monolítico a Modular
- Separación de responsabilidades en clases
- Eliminación de variables globales
- Patrón de módulos ES6
- Manejo de estado centralizado

### Beneficios de la Nueva Arquitectura
1. **Mantenibilidad**: Código organizado y fácil de modificar
2. **Escalabilidad**: Fácil agregar nuevas funciones
3. **Testabilidad**: Módulos independientes
4. **Performance**: Carga optimizada
5. **Debugging**: Herramientas de desarrollo mejoradas

---

¡Disfruta del quiz musical de Pokémon! 🎵🎮