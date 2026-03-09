import requests

BASE_URL = "http://127.0.0.1:8000"  

users = [
      {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+33634579302",
        "role": "Master"
    },
    {
        "name": "Alice Martin",
        "email": "alice.martin@example.com",
        "phoneNumber": "+33612345678",
        "role": "Guest"
    },
    {
        "name": "Bob Dupont",
        "email": "bob.dupont@example.com",
        "phoneNumber": "+33698765432",
        "role": "Admin"
    },
    {
        "name": "Claire Bernard",
        "email": "claire.bernard@example.com",
        "phoneNumber": "+33611111111",
        "role": "Technician"
    },
    {
        "name": "David Leroy",
        "email": "david.leroy@example.com",
        "phoneNumber": "+33611223344",
        "role": "Guest"
    },
]

for user in users:
  response = requests.post(f"{BASE_URL}/users/", json=user)
