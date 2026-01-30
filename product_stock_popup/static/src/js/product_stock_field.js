/** @odoo-module **/

import { Many2OneField } from "@web/views/fields/many2one/many2one_field";
import { usePopover } from "@web/core/popover/popover_hook";
import { ProductStockPopover } from "./product_stock_popover";
import { useService } from "@web/core/utils/hooks";
import { patch } from "@web/core/utils/patch";
import { onMounted, onWillUnmount } from "@odoo/owl";

const ALLOWED_MODELS = [
    "purchase.order.line",
    "sale.order.line",
    "account.move.line"
];

patch(Many2OneField.prototype, {
    _isAllowedModel() {
        if (this.relation !== "product.product") {
            return false;
        }

        const currentModel = this.props.record.resModel;
        console.log("STOCK POPUP: Checking model - currentModel =", currentModel);

        return ALLOWED_MODELS.includes(currentModel);
    },

    setup() {
        super.setup(...arguments);

        console.log("STOCK POPUP: setup called, relation =", this.relation);

        if (this._isAllowedModel()) {
            console.log("STOCK POPUP: Initializing for product.product field in allowed model");
            this.orm = useService("orm");
            this.stockPopover = usePopover(ProductStockPopover, {
                position: "right",
            });
            this._popoverTimeout = null;
            this._isMouseOver = false;

            onMounted(() => {
                console.log("STOCK POPUP: onMounted called");
                this._setupPopoverEvents();
            });

            onWillUnmount(() => {
                console.log("STOCK POPUP: onWillUnmount called");
                this._cleanupPopoverEvents();
            });
        }
    },

    _setupPopoverEvents() {
        // Find the component's root element
        const el = this.__owl__?.bdom?.el;
        console.log("STOCK POPUP: _setupPopoverEvents, el =", el);
        console.log("STOCK POPUP: __owl__ =", this.__owl__);
        console.log("STOCK POPUP: bdom =", this.__owl__?.bdom);

        if (el) {
            this._popoverEl = el;
            this._onMouseEnterBound = this._handleMouseEnter.bind(this);
            this._onMouseLeaveBound = this._handleMouseLeave.bind(this);
            el.addEventListener("mouseenter", this._onMouseEnterBound, true);
            el.addEventListener("mouseleave", this._onMouseLeaveBound, true);
            console.log("STOCK POPUP: Events attached to element");
        } else {
            console.log("STOCK POPUP: No element found!");
        }
    },

    _cleanupPopoverEvents() {
        if (this._popoverEl) {
            this._popoverEl.removeEventListener("mouseenter", this._onMouseEnterBound, true);
            this._popoverEl.removeEventListener("mouseleave", this._onMouseLeaveBound, true);
        }
        if (this._popoverTimeout) {
            clearTimeout(this._popoverTimeout);
        }
    },

    async _handleMouseEnter(ev) {
        if (!this._isAllowedModel()) {
            return;
        }

        console.log("STOCK POPUP: Mouse enter!", ev.target);
        if (this._popoverTimeout) {
            clearTimeout(this._popoverTimeout);
        }
        const targetElement = this._popoverEl;

        this._popoverTimeout = setTimeout(async () => {
            const value = this.value;
            console.log("STOCK POPUP: Timeout fired, value =", value);
            if (!value || !value[0]) {
                console.log("STOCK POPUP: No value, returning");
                return;
            }
            const productId = value[0];
            console.log("STOCK POPUP: Fetching stock for product ID:", productId);
            try {
                const stockInfo = await this.orm.call(
                    "product.product",
                    "get_stock_info_for_popup",
                    [productId]
                );
                console.log("STOCK POPUP: Got stock info:", stockInfo);

                if (this._isMouseOver) {
                    console.log("STOCK POPUP: Opening popover");
                    this.stockPopover.open(targetElement, {
                        stockInfo: stockInfo,
                    });
                }
            } catch (error) {
                console.error("STOCK POPUP: Error fetching stock info:", error);
            }
        }, 300);

        this._isMouseOver = true;
    },

    _handleMouseLeave() {
        if (!this._isAllowedModel()) {
            return;
        }

        console.log("STOCK POPUP: Mouse leave!");
        this._isMouseOver = false;
        if (this._popoverTimeout) {
            clearTimeout(this._popoverTimeout);
            this._popoverTimeout = null;
        }
        if (this.stockPopover) {
            this.stockPopover.close();
        }
    }
});
