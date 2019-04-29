import request from '../../utils/request';

export async function list({editorId, p=1, s=30} = {}) {
  return request('/api/examiner/1.0/record', {data: {p, s, editorId}, method: 'GET'});
}

export async function englishCompositionAnalyze({recordId}){
  return request('/api/examiner/1.0/english_composition_analyze', {data: {recordId}, method: 'GET'});
}
