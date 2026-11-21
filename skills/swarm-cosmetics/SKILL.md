---
name: swarm-cosmetics
description: Manage custom pixel hats for Antigravity Swarm bees based on agent roles, custom config overrides, and interactive Wardrobe UI.
---

# Swarm Cosmetics (Bee Hats) v1.2

Управляет уникальными процедурными пиксельными головными уборами для пчёлок-агентов в режиме Swarm в Google Antigravity, интерактивной вкладкой Wardrobe и переопределениями ролей через `cosmetics.config.json`.

## Доступные роли и шапки

| Роль | Ключевые паттерны в имени | Головной убор | Назначение в рое |
|---|---|---|---|
| **Coordinator** | `coordinator` | 👑 Корона с рубином | Пчеломатка / ведущий агент (встроена штатно) |
| **Builder / Engineer** | `builder`, `author`, `dev`, `code`, `parser`, `impl`, `fix`, `patch`, `engineer` | ⛑️ Желтая строительная каска | Разработка, фиксы, рефакторинг |
| **Verifier / QA** | `verifier`, `review`, `qa`, `test`, `audit`, `lint`, `check` | 🎓 Конфедератка с золотой кисточкой | Запуск тестов, проверка diff'ов |
| **Researcher / Analyst** | `research`, `scout`, `investig`, `search`, `doc`, `read`, `explore`, `analyst` | 🎩 Цилиндр с рубиновой лентой | Анализ кодовой базы, документация |
| **Narrator** | `narrator`, `story`, `scribe`, `log`, `write`, `history` | ✒️ Фиолетовый берет с пером | Системный агент (скилл `swarm_narrator`), летописец |
| **Monitor / Dispatcher** | `monitor`, `guard`, `watch`, `stall`, `dispatch`, `ping` | 👮 Офицерская фуражка с кокардой | Системный агент (скилл `swarm_monitor`), анти-зависание |
| **Wizard / AI** | `wizard`, `magic`, `ai`, `model`, `prompt`, `llm`, `synth`, `brain` | 🧙 Остроконечный колпак мага со звездой | Промптинг, генерация, интеграция нейросетей |
| **Pirate / Security** | `pirate`, `sec`, `security`, `hack`, `pentest`, `redteam`, `exploit` | 🏴‍☠️ Треуголка с повязкой на глазу | Безопасность, пентест, аудит уязвимостей |
| **Chef / Data** | `chef`, `cook`, `data`, `pipeline`, `etl`, `feed`, `clean`, `prep` | 🧑‍🍳 Высокий колпак шеф-повара | ETL, парсинг данных, подготовка датасетов |
| **Viking / Stress** | `viking`, `stress`, `bench`, `perf`, `load`, `speed`, `opt`, `heavy` | 🛡️ Шлем викинга с рогами | Нагрузочное тестирование, бенчмарки, профилирование |
| **Audio / Listener** *(Новое в v1.2)* | `headphones`, `listen`, `audio`, `music`, `sound` | 🎧 Студийные наушники | Анализ аудиопотока, голосовой ввод, мониторинг звука |
| **Telemetry / Debug** *(Новое в v1.2)* | `goggles`, `visor`, `scanner`, `telemetry`, `trace`, `debug`, `inspect` | 🥽 Кибер-визор | Метрики, сканеры телеметрии, трассировка в реальном времени |
| **Stealth / Security** *(Новое в v1.2)* | `ninja`, `stealth`, `shadow`, `silent`, `crypto`, `mask`, `bandana` | 🥷 Маска и бандана ниндзя | Скрытные вычисления, криптография, конфиденциальный аудит |
| *(Прочие)* | Любое другое имя | 📡 Стандартные усики | Рядовые воркеры |

---

## Вкладка Wardrobe в панели Swarm Board

В версии 1.2 в интерфейс панели Swarm Board встроен интерактивный гардероб (**Wardrobe**):
- **Увеличенный 8x холст (`176×144 px`):** отображает выбранную пчёлку в высоком разрешении.
- **Переключатели состояний:** полёт с анимацией взмаха крыльев (Flight), посадка (Landed), сон (Asleep).
- **Сетка каталога шапок:** клик по любой шапке немедленно примеряет её на холсте.
- **Селектор активных воркеров:** выпадающий список текущих участников роя (`window.SwarmSnapshot.members`) для мгновенного просмотра и переодевания.

---

## Конфигурация переопределений (`cosmetics.config.json`)

Файл `cosmetics.config.json` позволяет гибко задавать соответствие имён и шапок без изменения кода:

```json
{
  "overrides": {
    "lead": "crown",
    "infra-.*": "hardhat",
    "security-.*": "pirate",
    "listener-.*": "headphones"
  }
}
```

Правила применяются в следующем порядке:
1. `coordinator` / `queen` — всегда корона;
2. Точные совпадения (exact matches);
3. Регулярные выражения (regex pattern matches);
4. Дефолтные сопоставления по таблице каталога.

---

## Команды CLI

Скрипт управления расположен в `scripts/patch.js`:

```bash
# Проверить статус патча и активных переопределений
node scripts/patch.js status

# Применить / обновить шапки и интерфейс гардероба
node scripts/patch.js apply

# Просмотреть текущие переопределения конфигурации
node scripts/patch.js config show

# Добавить или обновить переопределение (с авто-патчингом)
node scripts/patch.js config set <nameOrPattern> <hatName>

# Откатить до исходного состояния (восстановление из бэкапов)
node scripts/patch.js restore
```
