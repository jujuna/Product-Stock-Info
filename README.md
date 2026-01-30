# Product Stock Info Popup - Odoo 19

## Description

This module enhances the user experience in Odoo 19 by displaying a hover popup with product information on product fields. When you hover over a product field in sales orders, purchase orders, or stock moves, a popup appears showing:

- Product image
- Product name and internal reference
- Stock quantities by location
- Available quantities (total - reserved)
- Reserved quantities
- Total available and reserved stock

## Features

- ✅ Works on Sales Order Lines
- ✅ Works on Purchase Order Lines  
- ✅ Works on Stock Move Lines
- ✅ Works on Stock Picking Operations
- ✅ Beautiful, responsive popup design
- ✅ Shows real-time stock information
- ✅ Displays stock by all internal locations
- ✅ Color-coded stock levels (green for available, red for negative, orange for reserved)
- ✅ Includes product image preview
- ✅ 300ms delay to prevent accidental popups

## Installation

1. Copy the `product_stock_popup` folder to your Odoo addons directory
2. Update the apps list in Odoo
3. Install the module "Product Stock Info Popup"

## Dependencies

- sale_management
- stock
- purchase

## Technical Details

### How It Works

1. **Custom Widget**: Creates a custom `product_stock_info` widget that extends the standard Many2One field
2. **Hover Events**: Adds mouse enter/leave event handlers with a 300ms delay
3. **RPC Call**: When hovering, makes an RPC call to `get_stock_info_for_popup` method
4. **Popover Display**: Shows a Bootstrap-styled popover with the retrieved information
5. **View Inheritance**: Automatically applies the widget to product fields in sales, purchase, and stock views

### Customization

You can customize the appearance by modifying:
- **Template**: `static/src/xml/product_stock_popover.xml`
- **Styling**: Add custom CSS in the template or create a separate CSS file
- **Delay**: Change the hover delay in `product_stock_field.js` (currently 300ms)
- **Image Size**: Modify the image size in `product_product.py` (currently using `image_128`)

### Performance

- Uses `image_128` for fast loading
- Implements hover delay to reduce unnecessary API calls
- Efficient stock calculation using Odoo's stock.quant model
- Only shows internal locations (not customer, vendor, or virtual locations)

## Usage

1. Open any Sales Order, Purchase Order, or Stock Picking
2. Hover your mouse over any product field
3. Wait 300ms for the popup to appear
4. The popup shows:
   - Product image (if available)
   - Product name and code
   - Stock by location with available and reserved quantities
   - Total stock summary

## Compatibility

- Odoo Version: 19.0
- Tested on: Community and Enterprise editions

## License

LGPL-3

## Author

Dato Zhuzhunadze

## Support

For support, please contact dzhuzhunadze1@gmail.com
