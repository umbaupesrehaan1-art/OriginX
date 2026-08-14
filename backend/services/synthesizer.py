from ctgan import CTGAN
import pandas as pd
from pathlib import Path


# ============================================================
# ORIGINX - SYNTHETIC DATA GENERATOR
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FOLDER = BASE_DIR / "data"

SYNTHETIC_FOLDER = DATA_FOLDER / "synthetic"

SYNTHETIC_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


def generate_synthetic_data(
    input_file: str,
    output_file: str,
    epochs: int = 100
):

    # --------------------------------------------------------
    # 1. Load dataset
    # --------------------------------------------------------

    input_path = DATA_FOLDER / input_file

    if not input_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {input_path}"
        )

    dataframe = pd.read_csv(input_path)

    if dataframe.empty:
        raise ValueError(
            "The dataset is empty."
        )

    # --------------------------------------------------------
    # 2. Detect categorical columns
    # --------------------------------------------------------

    categorical_columns = []

    for column in dataframe.columns:

        if dataframe[column].dtype == "object":

            categorical_columns.append(column)

    # --------------------------------------------------------
    # 3. Clean categorical values
    # --------------------------------------------------------

    for column in categorical_columns:

        dataframe[column] = (
            dataframe[column]
            .astype(str)
            .fillna("Unknown")
        )

    # --------------------------------------------------------
    # 4. Create CTGAN model
    # --------------------------------------------------------

    model = CTGAN(
        epochs=epochs,
        verbose=True
    )

    # --------------------------------------------------------
    # 5. Train CTGAN
    # --------------------------------------------------------

    model.fit(
        dataframe,
        discrete_columns=categorical_columns
    )

    # --------------------------------------------------------
    # 6. Generate synthetic records
    # --------------------------------------------------------

    synthetic_dataframe = model.sample(
        len(dataframe)
)

    # --------------------------------------------------------
    # 7. Save synthetic dataset
    # --------------------------------------------------------

    output_path = (
        SYNTHETIC_FOLDER / output_file
    )

    synthetic_dataframe.to_csv(
        output_path,
        index=False
    )

    # --------------------------------------------------------
    # 8. Return result
    # --------------------------------------------------------

    return {

        "input_file": str(input_path),

        "output_file": str(output_path),

        "original_records": len(dataframe),

        "synthetic_records": len(
            synthetic_dataframe
        ),

        "categorical_columns": categorical_columns,

        "columns": list(
            synthetic_dataframe.columns
        )
    }