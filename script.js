document.getElementById('csvFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  const rows = text.split('\n').slice(1).filter(Boolean);

  const token = '001Phg5mWA';
  const accountNumber = '3417';
  const shipToID = '107';

  const zip = new JSZip();
  const xmls = [];

  rows.forEach((row, idx) => {
    const [
      CustomerOrderNo, PONumber, RecipientName, Street1, Street2, City,
      State, ZipCode, Phone, EmailAddress, PartNumber, Qty, LocID,
      ShipDropship, Residential, DropshipBilling, CarrierID
    ] = row.split(',').map(s => s.replace(/\r|\"/g, '').trim());

    if (!CustomerOrderNo || !PartNumber || !Qty) return;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
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
    <Zip>${ZipCode}</Zip>
    <Phone>${Phone}</Phone>
  </DeliveryAddress>
  <LineItems>
    <ItemID>
      <PartNumber>${PartNumber}</PartNumber>
      <Qty>${Qty}</Qty>
      <LocID>${LocID}</LocID>
    </ItemID>
  </LineItems>
</Order>`;
    xmls.push({ name: `JBI-${CustomerOrderNo}-${accountNumber}.xml`, content: xml });
    zip.file(`JBI-${CustomerOrderNo}-${accountNumber}.xml`, xml);
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'jbi_orders.zip';
  a.textContent = 'Download XML ZIP';
  document.getElementById('downloadLink').innerHTML = '';
  document.getElementById('downloadLink').appendChild(a);

  // Enable upload button
  document.getElementById('uploadBtn').disabled = false;

  document.getElementById('uploadBtn').onclick = async () => {
    const formData = new FormData();
    formData.append('file', content, 'jbi_orders.zip');

    const response = await fetch('https://jbi-uploader.vercel.app/api/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      alert('Uploaded to FTP!');
    } else {
      alert('Upload failed');
    }
  };
});