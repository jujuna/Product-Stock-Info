/** @odoo-module **/

import { Many2One } from "@web/views/fields/many2one/many2one";
import { usePopover } from "@web/core/popover/popover_hook";
import { ProductStockPopover } from "./product_stock_popover";
import { useService } from "@web/core/utils/hooks";
import { patch } from "@web/core/utils/patch";

const ALLOWED_MODELS = [
    "purchase.order.line",
    "sale.order.line",
    "account.move.line"
];

patch(Many2One.prototype, {
    _isAllowedModel() {
        if (this.props.relation !== "product.product") {
            return false;
        }

        const parent = this.__owl__?.parent?.component;
        const currentModel = parent?.props?.record?.resModel || this.env.model?.config?.resModel;

        return ALLOWED_MODELS.includes(currentModel);
    },

    setup() {
        super.setup();

        if (this._isAllowedModel()) {
            this.orm = useService("orm");
            this.stockPopover = usePopover(ProductStockPopover, {
                position: "right",
            });
            this._popoverTimeout = null;
            this._isMouseOver = false;
        }
    },

    async onMouseEnter(ev) {
        if (!this._isAllowedModel()) {
            return;
        }

        if (this._popoverTimeout) {
            clearTimeout(this._popoverTimeout);
        }
        const targetElement = ev.currentTarget;

        this._popoverTimeout = setTimeout(async () => {
            const productValue = this.props.value;
            if (!productValue || !productValue.id) {
                return;
            }
            const productId = productValue.id;
            try {
                const stockInfo = await this.orm.call(
                    "product.product",
                    "get_stock_info_for_popup",
                    [productId]
                );

                if (this._isMouseOver) {
                    this.stockPopover.open(targetElement, {
                        stockInfo: stockInfo,
                    });
                }
            } catch (error) {
                console.error("PRODUCT STOCK POPUP: Error fetching stock info:", error);
            }
        }, 300);

        this._isMouseOver = true;
    },

    onMouseLeave() {
        if (!this._isAllowedModel()) {
            return;
        }

        this._isMouseOver = false;
        if (this._popoverTimeout) {
            clearTimeout(this._popoverTimeout);
            this._popoverTimeout = null;
        }
        this.stockPopover.close();
    }
});
