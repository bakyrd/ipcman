import s from "./config.module.scss"
import { useReqDataExtractorCode, useRespDataExtractorCode } from "../states"
import { TextField } from "@fluentui/react"

export const ConfigPage = () => {
  const [reqDataExtractorCode, setReqDataExtractorCode] = useReqDataExtractorCode()
  const [respDataExtractorCode, setRespDataExtractorCode] = useRespDataExtractorCode()

  return (
    <div className={s.container}>
      <h1>Config Page</h1>

      <div className="extractors">
        <h4>Data Extractor</h4>
        <TextField value={reqDataExtractorCode} onChange={(_, v) => setReqDataExtractorCode(v || '')} label="Request preview generator" multiline/>
        <TextField value={respDataExtractorCode} onChange={(_, v) => setRespDataExtractorCode(v || '')} label="Response preview generator" multiline/>


      </div>
    </div>
  )
}
