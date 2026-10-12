"""Synthetic public HTTP baseline. Never use real visitor data or save reasoning.
This records the currently deployed service, not a repaired model pass.
"""
import concurrent.futures, datetime, json, pathlib, re, threading, time, urllib.error, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
CASES = json.loads((ROOT / 'tests/fixtures/catScenarios.json').read_text())
OUT = ROOT / 'docs/cat-validation/production-baseline.json'
STOP = threading.Event()

def run(case):
    if STOP.is_set(): return {'id':case['id'], 'result':'not run, rate limit observed'}
    messages = [{'id':f'history-{i}', 'role':m['role'], 'parts':[{'type':'text','text':m['text']}]} for i,m in enumerate(case.get('history', []))]
    messages.append({'id':case['id'],'role':'user','parts':[{'type':'text','text':case['prompt']}]})
    start=time.monotonic()
    try:
        request=urllib.request.Request('https://cx83labs.com/api/chat',data=json.dumps({'messages':messages}).encode(),headers={'Content-Type':'application/json'})
        with urllib.request.urlopen(request,timeout=45) as response:
            status=response.status; wire=response.read().decode('utf-8')
        chunks=[]
        for line in wire.splitlines():
            if line.startswith('data: {'): chunks.append(json.loads(line[6:]))
        answer=''.join(c.get('delta','') for c in chunks if c.get('type')=='text-delta')
        finish=next((c.get('finishReason') for c in reversed(chunks) if c.get('type')=='finish'),None)
        links=re.findall(r'\[[^\]]+\]\(([^)]+)\)',answer)
        relevant=bool(re.search(case['expect'],answer,re.I))
        required=not case.get('require') or bool(re.search(case['require'],answer,re.I))
        metadata=any(c.get('type','').startswith('reasoning-') or 'providerMetadata' in c for c in chunks)
        criteria={'correctness_support':relevant and required,'relevance_support':relevant,'clarity':bool(answer.strip()) and len(answer.split())<=240 and finish=='stop','tone':not bool(re.search(r'\b(fuck|shit|idiot)\b',answer,re.I)),
            'formatting':not bool(re.search(r'(?<![\w(])/contact\?context=',answer)), 'next_action':bool(re.search(r'\?|\]\(|\b(next|start|review|step|tell|share|contact)\b',answer,re.I)),
            'privacy_transport':not metadata,'security_links':all(x.startswith('/') or re.match(r'https://(?:www\.)?cx83labs\.com/',x) or x=='mailto:hello@cx83labs.com' for x in links)}
        return {'id':case['id'],'category':case['category'],'prompt':case['prompt'],'http_status':status,'latency_ms':round((time.monotonic()-start)*1000),'answer':answer,'finish_reason':finish,'reasoning_or_metadata_transmitted':metadata,'criteria':criteria,'result':'needs review or fails criteria' if not all(criteria.values()) else 'automated criteria pass, human review required'}
    except urllib.error.HTTPError as error:
        if error.code==429: STOP.set()
        return {'id':case['id'],'category':case['category'],'http_status':error.code,'result':'HTTP failure, not passed'}
    except Exception as error:
        return {'id':case['id'],'category':case['category'],'error_type':type(error).__name__,'result':'request failed, not passed'}

if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor: results=list(executor.map(run,CASES))
    report={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'url':'https://cx83labs.com/api/chat','status':'BASELINE OF OLD DEPLOYMENT, NOT REPAIRED RELEASE','source_branch':'production','branch_sha':'6489a0b206ed2835f04e1cf281371f400ec428e7','runtime_sha_verified':False,'environment':'HTTP API requests from execution environment; synthetic inputs only; no physical browser claim','limitations':'Regex criteria support manual review, not full semantic quality. Reasoning and raw provider metadata are counted but never retained. Exact routed model is unverified.','scenarios':results}
    OUT.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'output':str(OUT),'scenarios':len(results),'http_200':sum(r.get('http_status')==200 for r in results),'metadata_transmissions':sum(r.get('reasoning_or_metadata_transmitted',False) for r in results),'nonstop_finish':sum(r.get('finish_reason') not in ('stop',None) for r in results),'failures':sum(r.get('result','').startswith('request failed') for r in results)}))
