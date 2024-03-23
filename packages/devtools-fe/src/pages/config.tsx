import s from "./config.module.scss"
import { useDataColorFlag, useDataFilter, useReqDataExtractorCode, useRespDataExtractorCode } from "../states"
import { TextField } from "@fluentui/react"

export const ConfigPage = () => {
  const [reqDataExtractorCode, setReqDataExtractorCode] = useReqDataExtractorCode()
  const [respDataExtractorCode, setRespDataExtractorCode] = useRespDataExtractorCode()
  const [dataColorFlag, setDataColorFlag] = useDataColorFlag()
  const [dataFilter, setDataFilter] = useDataFilter()

  return (
    <div className={s.container}>
      <h1>Config Page</h1>

      <div className="extractors">
        <h4>Data Extractor</h4>
        <TextField value={reqDataExtractorCode} onChange={(_, v) => setReqDataExtractorCode(v || '')} label="Request preview generator" multiline/>
        <TextField value={respDataExtractorCode} onChange={(_, v) => setRespDataExtractorCode(v || '')} label="Response preview generator" multiline/>

        <h4>Data Filter</h4>
        <TextField value={dataFilter} onChange={(_, v) => setDataFilter(v || '')} label="Data filter" multiline/>

        <h4>Data Color</h4>
        <TextField value={dataColorFlag} onChange={(_, v) => setDataColorFlag(v || '')} label="Data color flag" multiline/>

      </div>
    </div>
  )
}
