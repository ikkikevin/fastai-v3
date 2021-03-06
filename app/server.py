import aiohttp
import asyncio
import uvicorn
from fastai import *
from fastai.vision import *
import io
from starlette.applications import Starlette
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse, JSONResponse
from starlette.staticfiles import StaticFiles
import cv2
import numpy as np

# AUs model
#export_file_url = 'https://www.googleapis.com/drive/v3/files/1DbBviso0uSUcXuCCDG-QC5lCF9_hmkZf?alt=media&key=AIzaSyCc_2mS-vDiQqmGQI-vIHo3RzqslAP3Do0'

# Pain or No pain model
export_file_url = 'https://www.googleapis.com/drive/v3/files/1kCF22x7SLD01cNeCRGHqWBzoomI4nDiN?alt=media&key=AIzaSyCc_2mS-vDiQqmGQI-vIHo3RzqslAP3Do0'
export_file_name = 'export.pkl'

# Classes AUs model
#classes = ['1', '10', '11', '12', '14', '15', '16', '17', '18', '2', '20', '21', '22', '23', '24', '25', '26', '27', '30', '31', '38', '39', '4', '43', '45', '5', '54','6', '61', '62', '63', '64', '7', '9']

# Classes Pain or No pain model
classes = ['no pain', 'pain']
path = Path(__file__).parent

app = Starlette()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_headers=['X-Requested-With', 'Content-Type'])
app.mount('/static', StaticFiles(directory='app/static'))
app.mount('/images', StaticFiles(directory='app/images'))
app.mount('/images/icon', StaticFiles(directory='app/images/icon'))
app.mount('/view', StaticFiles(directory='app/view'))



async def download_file(url, dest):
    if dest.exists(): return
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.read()
            with open(dest, 'wb') as f:
                f.write(data)


async def setup_learner():
    await download_file(export_file_url, path / export_file_name)
    try:
        learn = load_learner(path, export_file_name)
        return learn
    except RuntimeError as e:
        if len(e.args) > 0 and 'CPU-only machine' in e.args[0]:
            print(e)
            message = "\n\nThis model was trained with an old version of fastai and will not work in a CPU environment.\n\nPlease update the fastai library in your training environment and export your model again.\n\nSee instructions for 'Returning to work' at https://course.fast.ai."
            raise RuntimeError(message)
        else:
            raise


loop = asyncio.get_event_loop()
tasks = [asyncio.ensure_future(setup_learner())]
learn = loop.run_until_complete(asyncio.gather(*tasks))[0]
loop.close()

@app.route('/')
async def homepage(request):
    html_file = path / 'view' / 'index.html'
    return HTMLResponse(html_file.open().read())




@app.route('/analyze', methods=['POST'])
async def analyze(request):
    data = await request.form()
    img_bytes = await (data['file'].read())
    image = cv2.imdecode(np.fromstring(img_bytes, np.uint8), 1)
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    next_image = cv2.adaptiveThreshold(gray_image,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,11,4)
    img_str = cv2.imencode('.jpg', next_image)[1].tostring()
    img = open_image(BytesIO(img_str))
    prediction = learn.predict(img)[0]
    return JSONResponse({'result': str(prediction)})

   

if __name__ == '__main__':
    if 'serve' in sys.argv:
        uvicorn.run(app=app, host='0.0.0.0', port=5000, log_level="info")
