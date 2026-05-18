# InvestOptimize — Portfolio Optimization Engine

InvestOptimize is an enterprise-grade portfolio allocation and optimization dashboard. The application parses client-side financial datasets (Excel/CSV), handles knapsack-style capital allocation calculations via a Python backend, and uses the `google-genai` SDK to deliver tailored, context-aware strategic investment summaries.

The system features an asynchronous client-side architecture with localized multi-language handling (English and Armenian), cross-chart state persistence, and native semantic theme syncing.

---

## Architecture Overview

```
                           +------------------------+
                           |  Frontend (Client)     |
                           |  - Vanilla JS / CSS 3  |
                           |  - Chart.js (Data Vis) |
                           |  - i18n Engine (EN/AM) |
                           +-----------+------------+
                                       |
                                       | Async HTTP POST (/optimize)
                                       v
                           +------------------------+
                           |  Backend Server        |
                           |  - WSGI API Layer      |
                           |  - Pandas / OpenPyXL   |
                           +-----------+------------+
                                       |
                                       | gRPC / RPC
                                       v
                           +------------------------+
                           |  Google GenAI Service  |
                           |  - gemini-2.5-flash    |
                           +------------------------+

```

### Key Technical Patterns

* **Decoupled i18n Tokenization:** Client-side localization utilizes data-attribute scanning (`data-i18n`) to rewrite the text layer dynamically without reloading the DOM or destroying instantiated component states (e.g., Chart canvas lifecycles).
* **State-Cached Chart Reflows:** Chart data arrays are cached globally at runtime. Language toggle changes trigger localized label updates and a complete `.update()` reflow to ensure seamless text parity across visualization layers.
* **Fail-Safe UI Streaming:** The frontend implements an optimized skeleton screen layer to mitigate perceived latency during heavy analytical computations and remote LLM execution blocks.

---

## Tech Stack

### Frontend

* **Runtime:** Vanilla ECMAScript (ES6+)
* **Visualization:** Chart.js v4.x (Doughnut & Smooth Cubic-Spline Line topologies)
* **Parsers:** XLSX.js (SheetJS) for client-side binary Excel parsing and previews

### Backend

* **Runtime:** Python 3.11+
* **Data Processing:** Pandas + OpenPyXL (Excel compression/parsing engine)
* **Core SDK:** `google-genai` (Current Generation Google AI Protocol Architecture)

---

## Production Installation & Local Setup

### Prerequisites

* Python 3.11 or higher installed on your host system.
* A valid Google Gemini API Key.

### Environment Implementation

1. **Clone the repository and initialize a isolated virtual environment:**
```bash
git clone https://github.com/your-repo/investoptimize.git
cd investoptimize
python -m venv venv

```


2. **Activate the environment context:**

```bash
   # MacOS / Linux
   source venv/bin/activate

   # Windows (PowerShell)
   .\venv\Scripts\Activate.ps1

```

3. **Install application dependencies:**

```bash
   pip install --upgrade pip
   pip install flask pandas openpyxl google-genai

```

4. **Inject your environment variables:**

```bash
   # MacOS / Linux
   export GEMINI_API_KEY="your_production_api_key_here"

   # Windows (PowerShell)
   $env:GEMINI_API_KEY="your_production_api_key_here"

```

5. **Boot the application server:**
```bash
python app.py

```



---

## Core API Specification

### Portfolio Optimization Contract

`POST /optimize`

#### Form-Data Payload Structure

| Parameter | Data Type | Constraint | Description |
| --- | --- |-----------| --- |
| `file` | Binary (`.csv`, `.xlsx`) | Required  | Source dataset containing projects, baseline costs, and projected ROI parameters. |
| `budget` | Integer | ≥ 0   | Total capital capacity available for optimization allocation. |
| `step` | Integer | ≥ 1     | Quantized iteration step size used during multi-pass allocation loops. |
| `mode` | String | `strict`  | `flexible` | Determines boundary criteria when evaluating remaining budget floors. |

#### Expected JSON Response Object (`200 OK`)

```json
{
  "error": false,
  "total_return": 145000,
  "remaining_budget": 1200,
  "allocation": {
    "Project Alpha": {
      "investment": 25000,
      "expected_return": 75000
    },
    "Project Beta": {
      "investment": 23800,
      "expected_return": 70000
    }
  },
  "explanation": "The portfolio optimization matrix indicates a high concentration in Project Alpha due to a 3x alpha generation efficiency profile..."
}

```

---

## Internationalization Architecture (i18n)

The dictionary is written to support scalable standard dictionaries. To expand translation strings, map keys directly inside the client dictionary abstraction:

```javascript
const translations = {
    en: {
        totalReturn: "Total Return",
        budgetAlloc: "Budget Allocation"
    },
    hy: {
        totalReturn: "Ընդհանուր Եկամտաբերություն",
        budgetAlloc: "Բյուջեի Բաշխում"
    }
};

```

To bind elements to this translation engine, mark the element with the corresponding data-attribute token:

```html
<span data-i18n="totalReturn">Total Return</span>
