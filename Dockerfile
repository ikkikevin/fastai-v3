FROM python:3.7-slim-stretch

RUN apt-get update && apt-get install -y git python3-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade -r requirements.txt

RUN mkdir -p ~/opencv cd ~/opencv && \
    wget https://github.com/opencv/opencv/archive/3.0.0.zip && \
    unzip 3.0.0.zip && \
    rm 3.0.0.zip && \
    mv opencv-3.0.0 OpenCV && \
    cd OpenCV && \
    mkdir build && \ 
    cd build && \
    cmake \
    -DWITH_QT=ON \ 
    -DWITH_OPENGL=ON \ 
    -DFORCE_VTK=ON \
    -DWITH_TBB=ON \
    -DWITH_GDAL=ON \
    -DWITH_XINE=ON \
    -DBUILD_EXAMPLES=ON .. && \
    make -j4 && \
    make install && \ 
    ldconfig

COPY app app/

RUN python app/server.py

EXPOSE 5000

CMD ["python", "app/server.py", "serve"]
