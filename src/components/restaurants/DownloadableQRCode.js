import React, { useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Block, Button, Container, } from 'react-bulma-components';
import { stringToValidFilename } from '../../utils';

export default function DownloadableQRCode({ info }) {
  const { name, url, size, logo } = info;
  const canvasRef = useRef(null);

  const downloadQRCode = async () => {
    const canvas = canvasRef.current.canvas.current;
    const dataUrl = await canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = stringToValidFilename(name) + '.png';
    downloadLink.click();
  };

  return (
    <Container className='has-text-left has-text-centered-mobile'>
      <QRCode value={url} logoImage={logo} size={size} ref={canvasRef} />
      <Block >
        <Button color={'primary'} size={'medium'} onClick={downloadQRCode}>{name} QR code</Button>
      </Block>
    </Container>
  );
}
