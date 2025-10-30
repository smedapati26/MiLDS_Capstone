from mssql.base import DatabaseWrapper as MSSQLDatabaseWrapper

from utils.auzre_token import get_token


class DatabaseWrapper(MSSQLDatabaseWrapper):
    token = None

    def get_connection_params(self):
        self.token = get_token(self.token)
        self.settings_dict["TOKEN"] = self.token.token
        return super().get_connection_params()
