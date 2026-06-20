# TrailScope: AI-Powered Financial Fraud Investigation Platform

## Overview

TrailScope is an AI-driven fraud investigation platform that transforms raw financial transaction data into interactive intelligence graphs. Instead of analyzing rows of transactions manually, investigators can identify suspicious accounts, fraud rings, and money trails through a visual investigation console powered by machine learning and graph analytics.

Built for Nexora'26 Cybersecurity Track.

---

## Key Features

### AI Risk Scoring

* Machine Learning-based fraud detection pipeline
* Risk scores generated for every account
* High, Medium, and Low risk categorization
* Human-readable fraud explanations

### Fraud Ring Detection

* Automatic identification of suspicious transaction clusters
* Highlighted fraud rings with associated accounts
* Cluster-level investigation summaries

### Interactive Investigation Console

* Risk leaderboard of flagged accounts
* Graph-based money trail visualization
* One-click account investigation
* Real-time account intelligence panel

### Graph Analytics

* Network relationship analysis
* Transaction flow visualization
* Suspicious account grouping
* Fraud cluster exploration

---

## System Architecture

```text
PaySim Transaction Dataset
            │
            ▼
     Data Preparation
            │
            ▼
   Feature Engineering
            │
            ▼
   Machine Learning Model
            │
            ▼
      Risk Scores
            │
            ▼
      Graph Builder
            │
            ▼
 Fraud Rings & Network Graph
            │
            ▼
      FastAPI Backend
            │
            ▼
 Investigation Console
```

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* GSAP
* Vis Network

### Backend

* FastAPI
* Python

### Machine Learning

* Random Forest Classifier
* Scikit-learn
* Pandas
* NumPy

### Data Processing

* Graph Analytics
* Network-based Fraud Detection

### Deployment

* Frontend: Vercel
* Backend: Render

---

## Project Structure

```text
fraud-detection-project/
│
├── backend/
│   ├── main.py
│   ├── data_prep.py
│   ├── feature_engineering.py
│   ├── train_model.py
│   └── graph_builder.py
│
├── data/
│   └── processed/
│       ├── risk_scores.json
│       ├── graph.json
│       └── sampled_transactions.csv
│
├── frontend/
│   ├── index.html
│   ├── investigation.html
│   ├── css/
│   └── js/
│
└── docs/
```

---

## API Endpoints

### Health Check

```http
GET /api/health
```

### Risk Scored Accounts

```http
GET /api/accounts
```

### Account Details

```http
GET /api/accounts/{accountId}
```

### Fraud Rings

```http
GET /api/rings
```

### Account Subgraph

```http
GET /api/graph/{accountId}
```

### Model Metrics

```http
GET /api/metrics
```

---

## Running Locally

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

Backend available at:

```text
http://localhost:8000
```

---

### Frontend

```bash
cd frontend

python3 -m http.server 3000
```

Frontend available at:

```text
http://localhost:3000
```

---

## Investigation Workflow

1. Risk scoring engine evaluates all accounts.
2. High-risk entities are flagged by the ML model.
3. Graph builder generates transaction networks.
4. Fraud rings are extracted from suspicious clusters.
5. FastAPI serves investigation data.
6. Investigators explore accounts through the interactive console.

---

## Sample Insights

* High-risk account detection
* Fraud ring discovery
* Transaction flow analysis
* Account intelligence profiling
* Network-based anomaly investigation

---

## Future Enhancements

* Real-time transaction ingestion
* Streaming fraud alerts
* Advanced graph neural networks
* Multi-hop investigation paths
* Analyst collaboration tools
* Explainable AI dashboards

---

## Team

TrailScope was developed as a hackathon project focused on modern AI-assisted financial crime investigation and graph-based fraud intelligence.

---

## License

This project is intended for educational, research, and hackathon demonstration purposes.
