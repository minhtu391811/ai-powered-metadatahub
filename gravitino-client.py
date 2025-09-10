from gravitino.client.gravitino_client import GravitinoClient
from gravitino.auth.default_oauth2_token_provider import DefaultOAuth2TokenProvider

try:
    auth_provider = DefaultOAuth2TokenProvider(
        uri="http://localhost:8177",
        path="/oauth2/token",
        credential="test:test",
        scope="test"
    )

    client = GravitinoClient(
        uri="http://localhost:8090",
        metalake_name="metalake_demo",
        auth_data_provider=auth_provider
    )

    print("Connected to Gravitino with OAuth (Python client)!")

except Exception as e:
    print("Error:", e)