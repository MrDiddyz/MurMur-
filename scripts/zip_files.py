from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

DOWNLOAD_DIR = Path("/Users/my_user_name/Desktop/my_folder")
ZIPPED_FILE_DIR = Path("/Users/my_user_name/Desktop/my_zip")
ZIP_NAME = "my_zip.zip"


def get_list_of_all_files(download_dir: Path) -> list[Path]:
    """Return all files under download_dir recursively."""
    if not download_dir.is_dir():
        raise NotADirectoryError(f"{download_dir} is not a directory")

    return [path for path in download_dir.rglob("*") if path.is_file()]


def zip_files(download_dir: Path = DOWNLOAD_DIR, output_dir: Path = ZIPPED_FILE_DIR) -> Path:
    """Zip every file in download_dir into output_dir/ZIP_NAME."""
    output_dir.mkdir(parents=True, exist_ok=True)
    zip_path = output_dir / ZIP_NAME

    files = get_list_of_all_files(download_dir)
    with ZipFile(zip_path, mode="w", compression=ZIP_DEFLATED) as archive:
        for file_path in files:
            archive.write(file_path, arcname=file_path.relative_to(download_dir))

    return zip_path


if __name__ == "__main__":
    created_zip = zip_files()
    print(f"Created: {created_zip}")
