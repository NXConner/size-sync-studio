from __future__ import annotations

from pathlib import Path
from typing import Callable, List, Tuple

import albumentations as A
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset


class SegDataset(Dataset):
    def __init__(self, images_dir: Path, masks_dir: Path, augment: Callable | None = None):
        self.images = sorted(list(Path(images_dir).glob("*.jpg"))) + sorted(list(Path(images_dir).glob("*.png")))
        self.masks_dir = Path(masks_dir)
        self.augment = augment

    def __len__(self) -> int:
        return len(self.images)

    def __getitem__(self, idx: int):
        img_path = self.images[idx]
        mask_path = self.masks_dir / img_path.name
        image = cv2.imread(str(img_path))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mask = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
        if mask is None:
            mask = np.zeros(image.shape[:2], dtype=np.uint8)

        if self.augment is not None:
            aug = self.augment(image=image, mask=mask)
            image, mask = aug['image'], aug['mask']

        image = image.astype(np.float32) / 255.0
        mask = (mask > 127).astype(np.float32)

        # HWC -> CHW
        image_t = torch.from_numpy(image.transpose(2, 0, 1))
        mask_t = torch.from_numpy(mask[None, ...])
        return image_t, mask_t


def default_transforms(img_size: int = 512) -> A.Compose:
    return A.Compose([
        A.LongestMaxSize(img_size),
        A.PadIfNeeded(img_size, img_size, border_mode=cv2.BORDER_CONSTANT),
        A.ColorJitter(p=0.3),
        A.GaussNoise(p=0.2),
        A.Blur(blur_limit=3, p=0.2),
    ])

