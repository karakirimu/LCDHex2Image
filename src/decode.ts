
const decodeVertical = (hex: string, delimiter: string, height: number, invert: boolean) => {
    const data = hex.split(delimiter).map(v => parseInt(v, 16))
    const h = Math.trunc(height / 8)
    const w = Math.trunc(data.length / h)

    if(h === 0){
      return undefined
    }

    const result = new Array<Array<boolean>>(height)

    for (let y = 0; y < height; y++)
    {
      result[y] = new Array<boolean>(w)
      for (let x = 0; x < w; x++)
      {
        const blockstart = Math.trunc(y / 8)
        const bit = invert? (7 - (y % 8)) : (y % 8);
        result[y][x] = ((data[x + blockstart * w] >> bit) & 1) > 0;
      }
    }

    return result;
  }

  const decodeHorizontal = (hex: string, delimiter: string, width: number, invert: boolean) => {
    const data = hex.split(delimiter).map(v => parseInt(v, 16))
    const w = Math.trunc(width / 8)

    if(w === 0){
      return undefined
    }

    const h = Math.trunc(data.length / w)

    const result = new Array<Array<boolean>>(h)

    for (let y = 0; y < h; y++)
    {
        result[y] = new Array<boolean>(width)
        for (let x = 0; x < width; x++)
        {
            const start = Math.trunc(x / 8);
            const bit = invert? (7 - (x % 8)) : (x % 8);

            result[y][x] = ((data[y*w + start] >> bit) & 1) > 0;
        }
    }

    return result;
}

export type Direction = "Vertical"|"Horizontal"

export interface decodeProps {
    direction: Direction,
    hex: string, 
    delimiter: string,
    width?: number,
    height?: number, 
    invert: boolean
}

export default function decode(props: decodeProps) {
    if(props.direction === "Vertical"){
        return (typeof props.height === "number")? decodeVertical(props.hex, props.delimiter, props.height!, props.invert) : undefined
    }

    return (typeof props.width === "number")? decodeHorizontal(props.hex, props.delimiter, props.width!, props.invert) : undefined
}