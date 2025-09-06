from __future__ import annotations

from pathlib import Path
from typing import Optional

import lightning as L
import segmentation_models_pytorch as smp
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader, random_split
import typer
from rich import print

from dataset import SegDataset, default_transforms


class SegModule(L.LightningModule):
    def __init__(self, lr: float = 1e-3):
        super().__init__()
        self.save_hyperparameters()
        self.net = smp.Unet(encoder_name="timm-efficientnet-b0", in_channels=3, classes=1)

    def forward(self, x):
        return self.net(x)

    def configure_optimizers(self):
        opt = torch.optim.AdamW(self.parameters(), lr=self.hparams.lr)
        sch = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=20)
        return {"optimizer": opt, "lr_scheduler": sch}

    def _step(self, batch, stage: str):
        x, y = batch
        logits = self(x)
        loss = smp.losses.DiceLoss(mode="binary")(logits, y) + F.binary_cross_entropy_with_logits(logits, y)
        with torch.no_grad():
            preds = (torch.sigmoid(logits) > 0.5).float()
            iou = (preds * y).sum() / ((preds + y - preds * y).sum() + 1e-6)
        self.log(f"{stage}/loss", loss, prog_bar=True)
        self.log(f"{stage}/iou", iou, prog_bar=True)
        return loss

    def training_step(self, batch, batch_idx):
        return self._step(batch, "train")

    def validation_step(self, batch, batch_idx):
        self._step(batch, "val")


app = typer.Typer(add_completion=False)


@app.command()
def main(
    images_dir: Path = typer.Option(..., exists=True, readable=True),
    masks_dir: Path = typer.Option(..., exists=True, readable=True),
    batch_size: int = typer.Option(8),
    epochs: int = typer.Option(20),
    val_split: float = typer.Option(0.1),
    out_dir: Path = typer.Option(Path("runs/seg")),
):
    print("[bold]Preparing datasets...[/bold]")
    ds = SegDataset(images_dir, masks_dir, augment=default_transforms(512))
    val_len = max(1, int(len(ds) * val_split))
    train_len = len(ds) - val_len
    train_ds, val_ds = random_split(ds, [train_len, val_len])

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=4)

    model = SegModule(lr=1e-3)
    trainer = L.Trainer(max_epochs=epochs, precision="16-mixed", default_root_dir=str(out_dir))
    trainer.fit(model, train_loader, val_loader)

    ckpt_path = out_dir / "model.ckpt"
    trainer.save_checkpoint(str(ckpt_path))
    print(f"[green]Saved checkpoint to {ckpt_path}")


if __name__ == "__main__":
    app()

