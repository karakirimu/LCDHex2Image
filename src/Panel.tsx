import { Text, Spacer, Card, Row, Col, Grid, Radio, Input, Textarea } from "@nextui-org/react"
import { useState, useRef, useEffect } from "react"

export interface PanelProps {
    direction?: string,
    width?: number,
    height?: number,
    delimiter?: string
}

export default function Panel(props: PanelProps) {
  const [hex, setHex] = useState("0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x80,0x09,0x60,0x12,0x20,0x13,0x20,0x1C,0xA0,0x00,0xC0,0x01,0x20,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00")
  const [direction, setDirection] = useState(props.direction ? props.direction : "Vertical")
  const [lcdWidth, setLcdWidth] = useState(props.width ? props.width : 16)
  const [lcdHeight, setLcdHeight] = useState(props.height ? props.height : 16)
  const [delimiter, setDelimiter] = useState(props.delimiter ? props.delimiter : ",")
  const canvasId= "lcdhex2bmp-" + crypto.randomUUID()
  const canvasRef = useRef(null)

  useEffect(() => {
    const decodeVertical = () => {
      const data = hex.split(delimiter).map(v => parseInt(v, 16))
      const h = Math.trunc(lcdHeight / 8)
      const w = Math.trunc(data.length / h)

      if(h === 0){
        return undefined
      }
  
      const result = new Array<Array<boolean>>(lcdHeight)
  
      for (let y = 0; y < lcdHeight; y++)
      {
        result[y] = new Array<boolean>(w)
        for (let x = 0; x < w; x++)
        {
          const blockstart = Math.trunc(y / 8)
          const bit = 7 - (y % 8);
          result[y][x] = ((data[x*h + blockstart] >> bit) & 1) > 0;
        }
      }
  
      return result;
    }
  
    const decodeHorizontal = () => {
      const data = hex.split(delimiter).map(v => parseInt(v, 16))
      const w = Math.trunc(lcdWidth / 8)

      if(w === 0){
        return undefined
      }

      const h = Math.trunc(data.length / w)
  
      const result = new Array<Array<boolean>>(h)
  
      for (let y = 0; y < h; y++)
      {
          result[y] = new Array<boolean>(lcdWidth)
          for (let x = 0; x < lcdWidth; x++)
          {
              const start = Math.trunc(x / 8);
              const bit = 7 - (x % 8);
  
              result[y][x] = ((data[y*w + start] >> bit) & 1) > 0;
          }
      }
  
      return result;
    }

    const rdata = direction === "Vertical" ? decodeVertical() : decodeHorizontal()
    const ctx = (canvasRef.current as unknown as HTMLCanvasElement).getContext('2d')

    if(rdata === undefined || rdata === null || ctx === null || ctx === undefined){
      return
    }

    ctx.imageSmoothingEnabled = false
    ctx.imageSmoothingQuality = "high"
    const image = ctx.createImageData(lcdWidth, lcdHeight);


    for(let y = 0; y < lcdHeight; y++){
      for(let x = 0; x < lcdWidth; x++) {
        const i = y * lcdHeight + x
        if(rdata[y][x]){
          image.data[i * 4 + 0] = 255; // 赤
          image.data[i * 4 + 1] = 255; // 緑
          image.data[i * 4 + 2] = 255; // 青
          image.data[i * 4 + 3] = 255; // アルファ
        }else{
          image.data[i * 4 + 0] = 0; // 赤
          image.data[i * 4 + 1] = 0; // 緑
          image.data[i * 4 + 2] = 0; // 青
          image.data[i * 4 + 3] = 255; // アルファ
        }
      }
    }

    ctx.putImageData(image, 0, 0)

  },[canvasId, delimiter, direction, hex, lcdHeight, lcdWidth])
  
  return (<>
    <Card css={{ p: "$6" }}>
        <Row gap={1}>
          <Col>
              <Card.Header>
                <Grid.Container>
                  <Grid xs={12}>
                    <Radio.Group orientation="horizontal" label="Direction" defaultValue="Vertical" onChange={(v) => {console.log(v); setDirection(v)}}>
                      <Radio value="Vertical" color="primary" >
                        Vertical
                      </Radio>
                      <Radio value="Horizontal" color="secondary">
                        Horizontal
                      </Radio>
                    </Radio.Group>
                  </Grid>
                  <Spacer y={1}/>
                  <Grid xs={12}>
                    <Input clearable label="Delimiter" placeholder="Regex" initialValue={delimiter} onInput={(v) => {console.log(v.currentTarget.value); setDelimiter(v.currentTarget.value)}} />
                  </Grid>
                  <Spacer y={1}/>
                  <Grid xs={12}>
                    <Input
                      label="Size"
                      area-label="hex-width"
                      labelLeft="width" 
                      labelRight="px" 
                      initialValue={lcdWidth.toString()}
                      type="number"
                      onChange={(v) => setLcdWidth(parseInt(v.currentTarget.value))}
                    />
                  </Grid>
                  <Spacer y={0.5}/>
                  <Grid xs={12}>
                    <Input
                      area-label="hex-height"
                      labelLeft="height" 
                      labelRight="px" 
                      initialValue={lcdHeight.toString()}
                      type="number"
                      onChange={(v) => setLcdHeight(parseInt(v.currentTarget.value))}
                    />
                  </Grid>
                </Grid.Container>
              </Card.Header>
              <Card.Body css={{ py: "$2" }}>
                <Textarea
                  label="Input hex array"
                  placeholder="Enter your amazing ideas."
                  initialValue={hex}
                  onInput={(v) => {console.log(v.currentTarget.value); setHex(v.currentTarget.value)}}
                />
              </Card.Body>
          </Col>
          <Col justify="center" align="center" textAlign="center">
            <Card.Header>
              <Text h4>Result</Text>
            </Card.Header>
            <Card.Body>
              <canvas ref={canvasRef} width={lcdWidth} height={lcdHeight} id={canvasId} />
            </Card.Body>
          </Col>
        </Row>
      </Card>
  </>);
}