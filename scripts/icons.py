"""Generate simple local app icons using only Python's standard library."""
import struct, zlib
from pathlib import Path
for size, name in [(192,'icon-192.png'),(512,'icon-512.png'),(180,'apple-touch-icon.png')]:
    rows=[]
    for y in range(size):
        row=bytearray()
        for x in range(size):
            u,v=x/size,y/size
            color=(36,92,72)
            if .26<u<.40 and .25<v<.75: color=(239,216,155)
            if .46<u<.60 and .25<v<.75: color=(239,216,155)
            if .66<u<.77 and (.50<v<.61 or .65<v<.76): color=(248,247,242)
            row.extend(color)
        rows.append(b'\0'+row)
    def chunk(kind,data):return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(rows)))+chunk(b'IEND',b'')
    Path('public',name).write_bytes(png)
