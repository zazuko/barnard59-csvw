#  bardnard59-csvw

Simplifies handling CSVW mapping documents in barnard59 pipelines

## Install

```
npm i -S barnard59-csvw
```

## Exported steps

### `fetch`

A step to automate loading CSVW mapping documents and the source CSV, by following the `csvw:url` property. The URL can be local filesystem path or remote URL.

| Argument | Type | Description |
| -- | -- | -- |
| `csvw` | `string` | Local path or URL of the mapping to load |

### Example: Loading CSVW from filesystem

```turtle
@prefix p: <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .

<#CsvwStep>
    a p:Step ;
    code:implementedBy [
        a code:EcmaScript ;
        code:link <node:barnard59-csvw#fetch>
    ] ;
    code:arguments [
        code:name "csvw" ;
        code:value "file:/test/mappings/remote.csvw.json"
    ] .
```
