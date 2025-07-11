import React, { useState } from 'react';
import JSZip from 'jszip';

export default function App() {
  const [zip, setZip] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').slice(1).filter(Boolean);

    const token = '001Phg5mWA';
    const accountNumber = '3417';
    const shipToID = '107';

    const xmlDocs = rows.map((row) => {
      const [
        CustomerOrderNo, PONumber, RecipientName, Street1, Street2, City,
        State, Zip, Phone, EmailAddress, PartNumber, Qty, LocID,
        ShipDropship, Residential, DropshipBilling, CarrierID
      ] = row.split(',').map((s) => s.replace(/\r|\"/g, '').trim());

      return [`JBI-${CustomerOrderNo}-${accountNumber}.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<Order>
  <Token>${token}</Token>
  <CustomerOrderNo>${CustomerOrderNo}</CustomerOrderNo>
  <PONumber>${PONumber}</PONumber>
  <AccountNumber>${accountNumber}</AccountNumber>
  <ShipToID>${shipToID}</ShipToID>
  <EmailAddress>${EmailAddress}</EmailAddress>
  <ShipDropship>${ShipDropship}</ShipDropship>
  <Residential>${Residential}</Residential>
  <DropshipBilling>${DropshipBilling}</DropshipBilling>
  <CarrierID>${CarrierID}</CarrierID>
  <DeliveryAddress>
    <RecipientName>${RecipientName}</RecipientName>
    <Street1>${Street1}</Street1>
    <Street2>${Street2}</Street2>
    <City>${City}</City>
    <State>${State}</State>
    <Zip>${Zip}</Zip>
    <Phone>${Phone}</Phone>
  </DeliveryAddress>
  <LineItems>
    <ItemID>
      <PartNumber>${PartNumber}</PartNumber>
      <Qty>${Qty}</Qty>
      <LocID>${LocID}</LocID>
    </ItemID>
  </LineItems>
</Order>`];
    });

    const zip = new JSZip();
    xmlDocs.forEach(([filename, xml]) => {
      zip.file(filename, xml);
    });

    setZip(await zip);
  };

  const handleDownload = async () => {
    if (!zip) return;
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jbi_orders.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFTPUpload = async () => {
    if (!zip) return;
    const blob = await zip.generateAsync({ type: 'blob' });
    const formData = new FormData();
    formData.append('file', new File([blob], 'jbi_orders.zip'));

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('✅ File uploaded to JBI FTP!');
    } else {
      alert('❌ Upload failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>JBI Order XML Converter</h2>
      <input type='file' accept='.csv' onChange={handleFileUpload} />
      <br/><br/>
      <button onClick={handleDownload}>📦 Download XML ZIP</button>
      <button onClick={handleFTPUpload} style={{ marginLeft: '10px' }}>🚀 Upload to FTP</button>
    </div>
  );
}
