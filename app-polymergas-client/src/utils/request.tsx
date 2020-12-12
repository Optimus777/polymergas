import axios from 'axios'
import {cloneDeep, isEmpty} from 'lodash'
import pathToRegexp from 'path-to-regexp'
import qs from 'qs'
import {STORAGE_NAME} from "./constant";

const {CancelToken} = axios;
window.cancelRequest = new Map()

export default function request(options:any) {
  let {data, url, method = 'get'} = options

  let cloneData = cloneDeep(data);

  try {
    let domain = ''
    const urlMatch = url.match(/[a-zA-z]+:\/\/[^/]*/)
    if (urlMatch) {

      [domain] = urlMatch
      url = url.slice(domain.length)
    }

    const match = pathToRegexp.parse(url)
    url = pathToRegexp.compile(url)(data)

    for (const item of match) {
      if (item instanceof Object && item.name in cloneData) {
        delete cloneData[item.name]
      }
    }
    url = domain + url
  } catch (e) {
  }
  data = data ? data : {path: ''}
  let newData:any = ""
  if (method.toLocaleLowerCase() === 'get' && data.path) {

    newData = cloneDeep(data);
    delete newData.path;
    if (Object.keys(newData).length > 0)
      newData = "?" + qs.stringify(newData)
    else newData = ""

  }
  options.url =
    method.toLocaleLowerCase() === 'get' ?
      (data.path
        ? `${url}${isEmpty(cloneData) ? '' : '/'}${data.path + newData}`
        : `${url}${isEmpty(cloneData) ? '' : '?'}${qs.stringify(cloneData)}`)
      : url;
  if (method.toLocaleLowerCase() === 'delete')
    options.url =
      method.toLocaleLowerCase() === 'delete'
        ? `${url}${isEmpty(cloneData) ? '' : '/'}${cloneData.id}`
        : url;
  if (method.toLocaleLowerCase() === 'put' && cloneData.path)
    options.url = `${url}${isEmpty(cloneData) ? '' : '/'}${cloneData.path}`;
  if (method.toLocaleLowerCase() === 'patch' && cloneData.path)
    options.url = `${url}${isEmpty(cloneData) ? '' : '/'}${cloneData.path}`;
  options.cancelToken = new CancelToken(cancel => {
    window.cancelRequest.set(Symbol(Date.now()), {
      pathname: window.location.pathname,
      cancel,
    })
  })
  axios.defaults.headers.common['Authorization'] = localStorage.getItem(STORAGE_NAME);

  try {

    data = {payload: {...data}}
    if (data.payload.fileUpload) {
      options.headers = {
        "Content-Type": "multipart/form-data"
      };
      const formData = new FormData();
      if (data.payload.file.length > 1) {
        Array.from(data.payload.file).forEach((file:any, i) => formData.append('files' + i, file));
      } else {
        formData.append('file', data.payload.file[0]);
      }
      delete data.payload.file;
      formData.append("type", data.payload.type);
      options.data = formData;
    }

    delete data.fileUpload;

  } catch (e) {

  }

  return axios(options)
    .then(response => {

      const {statusText, status, data} = response
      let result:any = {}

      if (typeof data === 'object') {
        if (Array.isArray(data)) {
          result.list = data
        } else {
          result = data
        }
      } else {
        result.data = data
      }

      return Promise.resolve({
        success: true,
        message: statusText,
        statusCode: status,
        ...result,
      })
    })
    .catch(error => {
      const {response, message} = error

      // if (String(message) === CANCEL_REQUEST_MESSAGE) {
      //   return {
      //     success: false,
      //   }
      // }

      let msg;
      let statusCode;

      if (response && response instanceof Object) {
        const {data, statusText} = response
        statusCode = response.status
        msg = data.message || statusText
      } else {
        statusCode = 600
        msg = error.message || 'Network Error'
      }

      /* eslint-disable */
      return Promise.resolve({
        success: false,
        statusCode,
        message: msg,
      })
    })
}
