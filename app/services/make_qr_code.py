import qrcode
from app.crud import asset as asset_crud
from sqlalchemy.orm import Session

def make_qr_code(db : Session, asset_id : str):
  asset = asset_crud.get_asset(db=db, asset_id=asset_id)
  if asset is None:
    return None
  
  url = f"http://127.0.0.1:8000/assets/{asset_id}"

  qr = qrcode.QRCode(
      version=1,
      box_size=10,
      border=5,
      error_correction=qrcode.constants.ERROR_CORRECT_M
  )

  qr.add_data(url)
  qr.make(fit=True)  
