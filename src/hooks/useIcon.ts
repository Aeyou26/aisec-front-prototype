export type IconProps = {
  size?: number
  height?: number
  width?: number
  color?: string
}
export default function useIcon(name: string, props?: IconProps) {
  const useName = h('use', { 'xlink:href': `#arco-icon-${name}`, fill: props?.color })
  const size = props?.size || 14
  return h('svg', { width: `${props?.width || size}px`, height: `${props?.height || size}px` }, [useName])
}
