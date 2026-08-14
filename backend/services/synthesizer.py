from ctgan import CTGAN
import pandas as pd
from pathlib import Path


# ============================================================
# ORIGINX - MEMORY-EFFICIENT SYNTHETIC DATA GENERATOR
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
    epochs: int = 10
):
    """
    Generate synthetic tabular data using a deployment-friendly CTGAN setup.

    Important for Render Free:
    - The source dataset can contain 5,000+ records.
    - CTGAN is trained on a capped subset to keep RAM usage below the
      512 MB Render Free limit.
    - The trained model can still generate the requested number of
      synthetic records.
    """

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

    original_record_count = len(dataframe)

    # --------------------------------------------------------
    # 2. Detect categorical columns
    # --------------------------------------------------------

    categorical_columns = [
        column
        for column in dataframe.columns
        if dataframe[column].dtype == "object"
    ]

    # --------------------------------------------------------
    # 3. Clean categorical values
    # --------------------------------------------------------

    for column in categorical_columns:
        dataframe[column] = (
            dataframe[column]
            .fillna("Unknown")
            .astype(str)
        )

    # --------------------------------------------------------
    # 4. Deployment-safe training dataset
    # --------------------------------------------------------
    # Render Free has only 512 MB RAM.
    # Training CTGAN on all 5,000 rows can exceed that limit.
    # We therefore train on at most 1,000 representative rows
    # and still generate the same number of output records.
    # --------------------------------------------------------

    MAX_TRAINING_ROWS = 1000

    if len(dataframe) > MAX_TRAINING_ROWS:
        training_dataframe = dataframe.sample(
            n=MAX_TRAINING_ROWS,
            random_state=42
        ).reset_index(drop=True)
    else:
        training_dataframe = dataframe.copy()

    # --------------------------------------------------------
    # 5. Limit epochs for the free deployment
    # --------------------------------------------------------
    # The frontend may request 10 or more epochs.
    # Keep the deployed workload bounded.
    # --------------------------------------------------------

    safe_epochs = max(1, min(int(epochs), 5))

    # --------------------------------------------------------
    # 6. Create memory-efficient CTGAN model
    # --------------------------------------------------------

    model = CTGAN(
        epochs=safe_epochs,
        batch_size=100,
        pac=1,
        generator_dim=(64, 64),
        discriminator_dim=(64, 64),
        verbose=True
    )

    # --------------------------------------------------------
    # 7. Train CTGAN
    # --------------------------------------------------------

    model.fit(
        training_dataframe,
        discrete_columns=categorical_columns
    )

    # --------------------------------------------------------
    # 8. Generate synthetic records
    # --------------------------------------------------------
    # Keep the output size equal to the original dataset size.
    # Sampling is done in batches to avoid a large temporary
    # memory spike.
    # --------------------------------------------------------

    target_records = original_record_count

    batch_size = 500
    generated_batches = []

    remaining = target_records

    while remaining > 0:
        current_batch = min(batch_size, remaining)

        generated_batch = model.sample(current_batch)

        generated_batches.append(generated_batch)

        remaining -= current_batch

    synthetic_dataframe = pd.concat(
        generated_batches,
        ignore_index=True
    )

    # Release model and training data before saving.
    del model
    del training_dataframe

    # --------------------------------------------------------
    # 9. Save synthetic dataset
    # --------------------------------------------------------

    output_path = SYNTHETIC_FOLDER / output_file

    synthetic_dataframe.to_csv(
        output_path,
        index=False
    )

    # --------------------------------------------------------
    # 10. Return result
    # --------------------------------------------------------

    return {
        "input_file": str(input_path),
        "output_file": str(output_path),
        "original_records": original_record_count,
        "training_records": len(
            dataframe
        ) if len(dataframe) <= MAX_TRAINING_ROWS else MAX_TRAINING_ROWS,
        "synthetic_records": len(synthetic_dataframe),
        "categorical_columns": categorical_columns,
        "columns": list(synthetic_dataframe.columns),
        "epochs_requested": int(epochs),
        "epochs_used": safe_epochs,
        "memory_optimized": True
    }