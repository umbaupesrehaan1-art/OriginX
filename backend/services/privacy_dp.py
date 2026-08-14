import torch
import torch.nn as nn

from torch.utils.data import DataLoader, TensorDataset
from torch.optim import SGD

from opacus import PrivacyEngine


# ============================================================
# ORIGINX - DIFFERENTIAL PRIVACY DEMO
# ============================================================

def run_dp_demo(
    records: int = 5000,
    epochs: int = 3,
    target_epsilon: float = 5.0,
    target_delta: float = 1e-5,
    batch_size: int = 256,
    max_grad_norm: float = 1.0
):
    """
    Demonstrates genuine DP-SGD training using PyTorch + Opacus.

    IMPORTANT:
    This is a DP training demonstration and is NOT claiming
    that the existing CTGAN model itself is DP.
    """

    # --------------------------------------------------------
    # 1. Create fictional training data
    # --------------------------------------------------------

    torch.manual_seed(42)

    input_features = 8

    x = torch.randn(
        records,
        input_features
    )

    y = torch.randint(
        0,
        2,
        (records,)
    )

    dataset = TensorDataset(
        x,
        y
    )

    data_loader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=True
    )

    # --------------------------------------------------------
    # 2. Simple PyTorch model
    # --------------------------------------------------------

    model = nn.Sequential(
        nn.Linear(input_features, 32),
        nn.ReLU(),
        nn.Linear(32, 2)
    )

    optimizer = SGD(
        model.parameters(),
        lr=0.05
    )

    criterion = nn.CrossEntropyLoss()

    # --------------------------------------------------------
    # 3. Attach Opacus PrivacyEngine
    # --------------------------------------------------------

    privacy_engine = PrivacyEngine()

    model, optimizer, private_loader = (
        privacy_engine.make_private_with_epsilon(
            module=model,
            optimizer=optimizer,
            data_loader=data_loader,
            criterion=criterion,
            target_epsilon=target_epsilon,
            target_delta=target_delta,
            epochs=epochs,
            max_grad_norm=max_grad_norm
        )
    )

    # --------------------------------------------------------
    # 4. DP-SGD training
    # --------------------------------------------------------

    model.train()

    total_steps = 0

    for epoch in range(epochs):

        for features, labels in private_loader:

            optimizer.zero_grad()

            predictions = model(
                features
            )

            loss = criterion(
                predictions,
                labels
            )

            loss.backward()

            optimizer.step()

            total_steps += 1

    # --------------------------------------------------------
    # 5. Get actual privacy budget
    # --------------------------------------------------------

    epsilon = privacy_engine.get_epsilon(
        delta=target_delta
    )

    noise_multiplier = (
        optimizer.noise_multiplier
    )

    # --------------------------------------------------------
    # 6. Return privacy report
    # --------------------------------------------------------

    return {

        "dp_enabled": True,

        "mechanism": "DP-SGD",

        "library": "Opacus",

        "framework": "PyTorch",

        "records_used": records,

        "epochs": epochs,

        "batch_size": batch_size,

        "max_grad_norm": max_grad_norm,

        "noise_multiplier": round(
            float(noise_multiplier),
            4
        ),

        "target_epsilon": target_epsilon,

        "achieved_epsilon": round(
            float(epsilon),
            4
        ),

        "delta": target_delta,

        "training_steps": total_steps,

        "privacy_statement": (
            "This component demonstrates "
            "differentially private training "
            "using DP-SGD with Opacus."
        ),

        "important_note": (
            "This DP guarantee applies to "
            "this PyTorch training process. "
            "It does not automatically make "
            "the separate CTGAN generator "
            "differentially private."
        )
    }