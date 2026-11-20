---
name: swarm-cosmetics
description: Manage custom pixel hats for Antigravity Swarm bees based on agent roles.
---

# Swarm Cosmetics (Bee Hats)

Управляет уникальными пиксельными головными уборами для пчёлок-агентов в режиме Swarm в Google Antigravity.

## Доступные роли и шапки

| Роль | Ключевые паттерны в имени | Головной убор | Назначение в рое |
|---|---|---|---|
| **Coordinator** | `coordinator` | 👑 Корона с рубином | Пчеломатка / ведущий агент (встроена штатно) |
| **Builder / Engineer** | `builder`, `author`, `dev`, `code`, `parser`, `impl`, `fix`, `patch`, `engineer` | ⛑️ Желтая строительная каска | Разработка, фиксы, рефакторинг |
| **Verifier / QA** | `verifier`, `review`, `qa`, `test`, `audit`, `lint`, `check` | 🎓 Конфедератка с золотой кисточкой | Запуск тестов, проверка diff'ов |
| **Researcher / Analyst** | `research`, `scout`, `investig`, `search`, `doc`, `read`, `explore`, `analyst` | 🎩 Цилиндр с рубиновой лентой | Анализ кодовой базы, документация |
| **Narrator** | `narrator`, `story`, `scribe`, `log`, `write`, `history` | 🪶 Фиолетовый берет с пером | Системный агент (скилл `swarm_narrator`), летописец |
| **Monitor / Dispatcher** | `monitor`, `guard`, `watch`, `stall`, `dispatch`, `ping` | 👮 Офицерская фуражка с кокардой | Системный агент (скилл `swarm_monitor`), анти-зависание |
| **Wizard / AI** | `wizard`, `magic`, `ai`, `model`, `prompt`, `llm`, `synth`, `brain` | 🧙 Остроконечный колпак мага со звездой | Промптинг, генерация, интеграция нейросетей |
| **Pirate / Security** | `pirate`, `sec`, `security`, `hack`, `pentest`, `redteam`, `exploit` | 🏴‍☠️ Треуголка с повязкой на глазу | Безопасность, пентест, аудит уязвимостей |
| **Chef / Data** | `chef`, `cook`, `data`, `pipeline`, `etl`, `feed`, `clean`, `prep` | 🧑‍🍳 Высокий колпак шеф-повара | ETL, парсинг данных, подготовка датасетов |
| **Viking / Stress** | `viking`, `stress`, `bench`, `perf`, `load`, `speed`, `opt`, `heavy` | 🛡️ Шлем викинга с рогами | Нагрузочное тестирование, бенчмарки, профилирование |
| *(Прочие)* | Любое другое имя | 📡 Стандартные усики | Рядовые воркеры |

## Команды CLI

Скрипт управления расположен в `scripts/patch.js`:

```bash
# Проверить статус
node scripts/patch.js status

# Применить / обновить шапки
node scripts/patch.js apply

# Откатить до исходного состояния
node scripts/patch.js restore
```
