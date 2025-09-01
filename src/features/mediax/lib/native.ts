export async function setStatusBarDark() {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
  } catch { /* noop on web */ }
}

export async function hapticImpact() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch { /* noop on web */ }
}

