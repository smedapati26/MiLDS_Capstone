from azure.storage.blob import BlobClient, ContainerClient
from django.conf import settings
from django.core.files import File
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class AzureContainerStorage(Storage):
    """
    cArmy Azure Compliant Azure Storage Account storage backend

    This storage backend uses the Azure Blob Storage backend to support
    managing files against an Azure Storage Account backend. It requires
    two settings be maintained in the project's settings:

    AZURE_ACCOUNT_URL : the account_url, including SAS token for the storage account
    container you would like to use as your storage backend
    AZURE_CONTAINER : the name of the container to use as the storage backend
    """

    def __init__(self, az_act_url: str, az_container: str):
        """Initialize the storage backend by reading in the settings"""
        self.account_url = az_act_url
        self.container_name = az_container

    def _open(self, name: str, mode: str = "rb") -> File:
        """
        Opens a given file name from the container

        @param name: (str) the blob name to read from the storage container
        @param mode: (str) UNUSED; required by Django base storage class

        @returns (django.core.files.File) the File object
        """
        client = self._get_blob_client_sas(name)

        with open("temp", "wb") as temp_file:
            temp_file.write(client.download_blob().readall())

        return File(open("temp", "rb"), name=name)

    def _save(self, name: str, content: File) -> str:
        """
        Saves a given file contents to the container

        @param name: (str) the name to use when saving the blob
        @param content: (django.core.files.File) the file contents (requires binary)

        @returns (str) the name used by the container when saving the blob
        """
        client = self._get_blob_client_sas(name)

        client.upload_blob(data=content)

        return client.get_blob_properties().name

    def delete(self, name: str) -> None:
        """
        Deletes the given blob name from the container, if it exists

        @param name: (str) the name of the blob to delete
        """
        client = self._get_blob_client_sas(name)

        client.delete_blob()

    def exists(self, name: str) -> bool:
        """
        Checks the existence of a given blob in the container

        @param name: (str) the name of the blob

        @returns (bool) Truthy denoting if a blob with the given name exists
        """
        client = self._get_blob_client_sas(name)

        return client.exists()

    def size(self, name: str) -> int:
        """
        Gets the size, in bytes, of a blob in the container

        @param name: (str) the name of the blob

        @returns (int) the size of the given blob in bytes
        """
        client = self._get_blob_client_sas(name)

        return client.get_blob_properties().size

    def path(self, name: str) -> str:
        """
        Gets the path to the blob within the container

        @param name: (str) the name of the blob within the container

        @returns (str) the path to the blob in the container
        """
        client = self._get_blob_client_sas(name)

        return client.get_blob_properties().name

    def url(self, name: str) -> str:
        """
        Gets the path to the blob within the container

        @param name: (str) the name of the blob within the container

        @returns (str) the path to the blob in the container
        """
        client = self._get_blob_client_sas(name)

        return client.get_blob_properties().name

    def _get_container_client_sas(self) -> ContainerClient:
        """
        Private method to create an Azure ContainerClient

        @returns (azure.storage.blob.ContainerClient) The client object
        """
        client = ContainerClient(account_url=self.account_url, container_name=self.container_name)

        return client

    def _get_blob_client_sas(self, name: str) -> BlobClient:
        """
        Private method to create an Azure BlobClient

        @returns (azure.storage.blob.BlobClient) The client object
        """
        client = BlobClient(account_url=self.account_url, container_name=self.container_name, blob_name=name)

        return client
