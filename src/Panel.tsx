import { Spacer, Card, Radio, Input, Textarea, Switch, CardBody, CardHeader, RadioGroup, Button } from "@nextui-org/react"
import { useRef, useEffect, useContext, useState } from "react"
import { AppContext, Operation, PanelOperation } from "./AppContextProvider"
import { MdClose } from "react-icons/md"
import decode, { decodeProps } from "./decode"

export interface PanelProps {
    hex: string,
    direction: string,
    width: number,
    height: number,
    delimiter: string,
    invert: boolean,
    id: string
}

export default function Panel(props: PanelProps) {
  const canvasId= "lcdhex2bmp-" + crypto.randomUUID()
  const directionRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef(null)
  const textareaRef = useRef<HTMLInputElement>(null)
  const heightRef = useRef<HTMLInputElement>(null)
  const widthRef = useRef<HTMLInputElement>(null)
  const delimiterRef = useRef<HTMLInputElement>(null)
  const [hexPlaceHolder, setHexPlaceHolder] = useState("e.g. 0x00,0xff,0xff,0x00 ...")
  const c = useContext(AppContext)

  useEffect(() => {
    console.log(`useEffect ${props.id}`)
    if(typeof textareaRef.current?.value !== "undefined"){
      textareaRef.current!.value = props.hex
    }

    if(typeof heightRef.current?.value !== "undefined"){
      heightRef.current!.value = props.height.toString()
    }

    if(typeof widthRef.current?.value !== "undefined"){
      widthRef.current!.value = props.width.toString()
    }

    if(typeof delimiterRef.current?.value !== "undefined"){
      delimiterRef.current!.value = props.delimiter
      const d = props.delimiter
      setHexPlaceHolder(`e.g. 0x00${d}0xff${d}0xff${d}0x00 ...`)
    }

    if(typeof directionRef.current?.value !== "undefined"){
      directionRef.current!.value = props.direction
    }

    const dec = () => {
      const d : decodeProps = {
        direction: (props.direction === "Vertical")? "Vertical":"Horizontal",
        hex: props.hex,
        delimiter: props.delimiter,
        width: props.width,
        height: props.height,
        invert: props.invert
      }
      return decode(d)
    }

    const rdata = dec()
    const ctx = (canvasRef.current as unknown as HTMLCanvasElement).getContext('2d')

    if(rdata === undefined || rdata === null || ctx === null || ctx === undefined){
      return
    }

    if(rdata.length == 0 || props.height == 0 || props.width == 0){
      return
    }

    ctx.imageSmoothingEnabled = false
    ctx.imageSmoothingQuality = "high"
    const image = ctx.createImageData(props.width, props.height);


    for(let y = 0; y < props.height; y++){
      for(let x = 0; x < props.width; x++) {
        const i = y * props.width + x
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

  },[canvasId])
  
  const handleEdit = (o: PanelOperation, v: string) => {
    console.log(`Operation: ${o}, Value: ${v}`)
    c.context.set({
      operation: Operation.Edit,
      panel: { id: props.id, operation: o, value: v }
    })
  }

  return (<>
    <Card>
        <div className="flex flex-row gap-1">
          <div className="flex flex-col gap-1">
              <CardBody>
                <div className="flex flex-row gap-12">
                  <RadioGroup 
                    ref={directionRef}
                    label="Direction"
                    orientation="vertical"
                    defaultValue="Vertical"
                    onValueChange={(v: string) => {handleEdit(PanelOperation.Direction, v)}}>
                    <Radio value="Vertical" color="primary">Vertical</Radio>
                    <Radio value="Horizontal" color="secondary">Horizontal</Radio>
                  </RadioGroup>
                  <Switch isSelected={props.invert} onChange={(v: any) => {
                    handleEdit(PanelOperation.Invert, v.currentTarget.checked)}}>
                    Invert
                  </Switch>
                </div>
                <Spacer y={4}/>
                <p className="text-neutral-400 text-inherit">Size</p>
                <Spacer y={2}/>
                <div className="flex flex-row gap-2">
                  <Input
                    area-label="hex-width"
                    ref={widthRef}
                    label="width"
                    min={1}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">px</span>
                      </div>
                    }
                    defaultValue={props.width.toString()}
                    type="number"
                    onChange={(v) => {handleEdit(PanelOperation.Width, v.currentTarget.value)}}
                  />
                  <Input
                    area-label="hex-height"
                    ref={heightRef}
                    label="height"
                    min={1}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">px</span>
                      </div>
                    }
                    defaultValue={props.height.toString()}
                    type="number"
                    onChange={(v) => {handleEdit(PanelOperation.Height, v.currentTarget.value)}}
                  />
                </div>
                <Spacer y={4}/>
                <p className="text-neutral-400 text-inherit">Input</p>
                <Spacer y={2}/>
                <Input isClearable
                  ref={delimiterRef}
                  label="Delimiter"
                  placeholder="Regex"
                  defaultValue={props.delimiter}
                  onClear={() => {handleEdit(PanelOperation.Delimiter, '')}}
                  onInput={(v) => {handleEdit(PanelOperation.Delimiter, v.currentTarget.value)}} />
                <Spacer y={2}/>
                <Textarea
                  ref={textareaRef}
                  label="Input hex array"
                  placeholder={hexPlaceHolder}
                  defaultValue={props.hex}
                  onInput={(v) => {handleEdit(PanelOperation.Hex, v.currentTarget.value)}}
                />
              </CardBody>
          </div>
          <div className="flex w-full flex-col gap-1 justify-center text-center">
            <CardHeader className="px-5 pb-1 justify-between">
              <p>Result</p>
              <Button
                isIconOnly
                radius="md"
                onClick={() => c.context.set({operation: Operation.Remove, panel: {id: props.id}})}>
                <MdClose />
              </Button>
            </CardHeader>
            <CardBody className="pt-1">
              <canvas className="border-2" ref={canvasRef} width={props.width} height={props.height} id={canvasId} />
            </CardBody>
          </div>
        </div>
      </Card>
  </>);
}