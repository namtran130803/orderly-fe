export function groupItems(items: { nameSnapshot: string; qty: number; statusId: number | null; statusSnapshot: string | null; priceSnapshot: number }[]) {
  return items.reduce((acc: any[], item) => {
    const existing = acc.find(
      (i) => i.name === item.nameSnapshot && i.statusId === item.statusId,
    );
    if (existing) {
      existing.qty += item.qty;
    } else {
      acc.push({
        name: item.nameSnapshot,
        qty: item.qty,
        statusSnapshot: item.statusSnapshot,
        statusId: item.statusId,
        priceSnapshot: item.priceSnapshot,
      });
    }
    return acc;
  }, []);
}
