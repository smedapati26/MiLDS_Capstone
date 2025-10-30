import tarfile

TarFile_orig = tarfile.TarFile


class SafeTarFile(TarFile_orig):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for tarinfo in list(self):
            if tarinfo.offset < 0:
                raise tarfile.TarError("Negative offset detected in tar entry.")


tarfile.TarFile = SafeTarFile
