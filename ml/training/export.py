from __future__ import annotations

from pathlib import Path

import lightning as L
import onnx
import torch
import typer

from train import SegModule


app = typer.Typer(add_completion=False)


@app.command()
def onnx_export(
    checkpoint: Path = typer.Option(..., exists=True, readable=True),
    out_onnx: Path = typer.Option(Path("segmentation.onnx")),
    height: int = typer.Option(512),
    width: int = typer.Option(512),
):
    model = SegModule.load_from_checkpoint(str(checkpoint))
    model.eval()
    x = torch.randn(1, 3, height, width)
    torch.onnx.export(
        model,
        x,
        str(out_onnx),
        input_names=["input"],
        output_names=["logits"],
        opset_version=17,
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
    )
    onnx_model = onnx.load(str(out_onnx))
    onnx.checker.check_model(onnx_model)
    typer.echo(f"Saved ONNX to {out_onnx}")


if __name__ == "__main__":
    app()

