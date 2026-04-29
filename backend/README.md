# Elyndor Management OS — Backend

## Setup & Run

```bash
cd backend
pip install -r requirements.txt
python main.py
```

API will be available at: http://localhost:8000
Interactive docs: http://localhost:8000/docs

## Environment Variables (.env)

Create a `.env` file in the backend folder:

```
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///./elyndor.db
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | None | Register new user |
| POST | /auth/login | None | Login, get JWT token |
| GET | /auth/me | Any | Get current user |
| GET | /dashboard/stats | CEO | KPI stats |
| GET | /projects | Any | List projects |
| POST | /projects | CEO | Create project |
| PATCH | /projects/{id} | CEO | Update project |
| DELETE | /projects/{id} | CEO | Delete project |
| GET | /clients | CEO | List clients |
| POST | /clients | CEO | Add client |
| PATCH | /clients/{id} | CEO | Update client |
| GET | /resources | CEO | List roles |
| POST | /resources | CEO | Create role |
| PATCH | /resources/{id} | CEO | Update role |
| POST | /attendance/checkin | Any | Check in |
| POST | /attendance/checkout | Any | Check out |
| GET | /attendance/me | Any | My attendance |
| GET | /attendance/today | Any | Today's record |
| GET | /attendance/all | CEO | All records |
| POST | /worklogs | Any | Submit work log |
| GET | /worklogs/me | Any | My logs |
| GET | /worklogs/all | CEO | All logs |
| GET | /performance | CEO | All performance |
| PATCH | /performance | CEO | Update zone |
| PATCH | /performance/users/{id}/deactivate | CEO | Terminate user |
