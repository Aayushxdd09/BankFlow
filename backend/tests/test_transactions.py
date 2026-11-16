
def create_test_user(client):
    client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "phone": "9876543210",
            "password": "TestPass123"
        }
    )

    login_response = client.post(
        "/auth/login",
        data={
            "username": "test@example.com",
            "password": "TestPass123"
        }
    )

    token = login_response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def test_deposit_money(client):
    headers = create_test_user(client)

    response = client.post(
        "/transactions/deposit",
        json={"amount": 1000},
        headers=headers
    )

    assert response.status_code == 200

    account_response = client.get(
        "/accounts/me",
        headers=headers
    )

    assert float(account_response.json()["balance"]) == 1000


def test_withdraw_money(client):
    headers = create_test_user(client)

    client.post(
        "/transactions/deposit",
        json={"amount": 2000},
        headers=headers
    )

    response = client.post(
        "/transactions/withdraw",
        json={"amount": 300},
        headers=headers
    )

    assert response.status_code == 200, response.json()

    account_response = client.get(
        "/accounts/me",
        headers=headers
    )

    assert float(account_response.json()["balance"]) == 1700

def test_withdraw_insufficient_balance(client):
    headers = create_test_user(client)

    response = client.post(
        "/transactions/withdraw",
        json={"amount": 1000},
        headers=headers
    )

    assert response.status_code == 400


def test_transfer_money(client):
    # Create receiver
    client.post(
        "/auth/register",
        json={
            "full_name": "Receiver User",
            "email": "receiver@example.com",
            "phone": "9876543211",
            "password": "TestPass123"
        }
    )

    receiver_login = client.post(
        "/auth/login",
        data={
            "username": "receiver@example.com",
            "password": "TestPass123"
        }
    )

    receiver_token = receiver_login.json()["access_token"]
    receiver_headers = {
        "Authorization": f"Bearer {receiver_token}"
    }

    receiver_account = client.get(
        "/accounts/me",
        headers=receiver_headers
    ).json()

    receiver_account_number = receiver_account["account_number"]

    # Create sender
    sender_headers = create_test_user(client)

    # Deposit into sender account
    client.post(
        "/transactions/deposit",
        json={"amount": 2000},
        headers=sender_headers
    )

    # Transfer ₹500
    response = client.post(
        "/transactions/transfer",
        json={
            "receiver_account_number": receiver_account_number,
            "amount": 500
        },
        headers=sender_headers
    )

    assert response.status_code == 200, response.json()

    # Verify sender balance
    sender_balance = client.get(
        "/accounts/me",
        headers=sender_headers
    ).json()["balance"]

    assert float(sender_balance) == 1500

    # Verify receiver balance
    receiver_balance = client.get(
        "/accounts/me",
        headers=receiver_headers
    ).json()["balance"]

    assert float(receiver_balance) == 500
