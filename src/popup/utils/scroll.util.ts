export function followScroll(container: HTMLElement, item: HTMLElement, index: number) {
  const containerViewTop = container.scrollTop,
    containerHeight = container.offsetHeight,
    containerViewBottom = containerViewTop + containerHeight,
    itemTop = item.offsetTop,
    itemHeight = item.offsetHeight,
    itemBottom = itemTop + itemHeight;

  // Hold out to first section
  if (index === 0) {
    container.scrollTop = 0;
  } else if (itemTop < containerViewTop) {
    container.scrollTop = itemTop;
  } else if (itemBottom > containerViewBottom) {
    container.scrollTop = itemBottom - containerHeight;
  }
}
