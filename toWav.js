const sampleRate = 16000;
const channels = 1;
const bitDepth = 16;

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export default function(samples){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  var offset = 0;

  /* RIFF identifier */
  writeString(view, offset, 'RIFF');
  offset += 4; // 'RIFF'.length
  /* file length */
  // view.setUint32(4, 32 + samples.length, true);
  view.setUint32(offset, (44 + samples.length * 2) - 8, true);
  offset += 4;
  /* RIFF type */
  writeString(view, offset, 'WAVE');
  offset += 4; // 'WAVE'.length

  /* format chunk identifier */
  writeString(view, offset, 'fmt ');
  offset += 4; // 'fmt '.length

  /* format chunk length */
  view.setUint32(offset, 16, true);
  offset += 4;

  /* sample format (raw) */
  view.setUint16(offset, 1, true);
  offset += 2;

  /* channel count */
  view.setUint16(offset, 1, true);
  offset += 2;

  /* sample rate */
  view.setUint32(offset, sampleRate, true);
  offset += 4;

  // write the byte rate
  var byteRate = this.byteRate;
  if (byteRate == null) {
    byteRate = sampleRate * channels * bitDepth / 8;
  }
  view.setUint32(offset, byteRate, true);
  offset += 4;

  /* block align (channel count * bytes per sample) */
  view.setUint16(offset, 2, true);
  offset += 2;

  /* bits per sample */
  view.setUint16(offset, bitDepth, true);
  offset += 2;

  /* data chunk identifier */
  writeString(view, offset, 'data');
  offset += 4; // 'data'.length

  /* data chunk length */
  view.setUint32(offset, samples.length * 2, true);
  offset += 4;

  for(let i=0; i<samples.length; i++) {
    view.setInt16(offset, samples[i], true);
    offset += 2;
  }

  return view;
}