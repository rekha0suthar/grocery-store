// Product validation business rules - Single source of truth for product validation

// Business constants
export const PRODUCT_RULES = {
    SKU_PATTERN: /^[A-Z0-9-]{3,20}$/,
    URL_PATTERN: /^https?:\/\/.+/,
    // More flexible data URL pattern to support common image formats
    IMAGE_URL_PATTERN: /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp|ico);base64,.+/,
    BARCODE_PATTERN: /^[0-9]{8,14}$/,

    UNITS: ['piece', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'gal', 'qt', 'pt', 'dozen', 'pack', 'box', 'case'],
    STATUSES: ['active', 'inactive'],
    VISIBILITY: ['visible', 'hidden'],

    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 255,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 2000,
    SKU_MIN_LENGTH: 3,
    SKU_MAX_LENGTH: 20,
    BARCODE_MIN_LENGTH: 8,
    BARCODE_MAX_LENGTH: 14,
    MANUFACTURER_MIN_LENGTH: 2,
    MANUFACTURER_MAX_LENGTH: 100,
    COUNTRY_MIN_LENGTH: 2,
    COUNTRY_MAX_LENGTH: 50,
    TAG_MIN_LENGTH: 1,
    TAG_MAX_LENGTH: 50,

    PRICE_MIN: 0,
    PRICE_MAX: 1000000,
    STOCK_MIN: 0,
    WEIGHT_MIN: 0,
    WEIGHT_MAX: 1000
};

// Individual validation functions
export function isValidProductName(name) {
    return typeof name === 'string' &&
        name.trim().length >= PRODUCT_RULES.NAME_MIN_LENGTH &&
        name.trim().length <= PRODUCT_RULES.NAME_MAX_LENGTH;
}

export function isValidSKU(sku) {
    return typeof sku === 'string' &&
        sku.trim().length >= PRODUCT_RULES.SKU_MIN_LENGTH &&
        sku.trim().length <= PRODUCT_RULES.SKU_MAX_LENGTH &&
        PRODUCT_RULES.SKU_PATTERN.test(sku.trim());
}

export function isValidPrice(price) {
    return typeof price === 'number' &&
        price >= PRODUCT_RULES.PRICE_MIN &&
        price <= PRODUCT_RULES.PRICE_MAX;
}

export function isValidStock(stock) {
    return Number.isInteger(stock) && stock >= PRODUCT_RULES.STOCK_MIN;
}

export function isValidMinStock(minStock) {
    return Number.isInteger(minStock) && minStock >= PRODUCT_RULES.STOCK_MIN;
}

export function isValidMaxStock(maxStock) {
    return Number.isInteger(maxStock) && maxStock > 0;
}

export function isValidWeight(weight) {
    return typeof weight === 'number' &&
        weight >= PRODUCT_RULES.WEIGHT_MIN &&
        weight <= PRODUCT_RULES.WEIGHT_MAX;
}

export function isValidUnit(unit) {
    return typeof unit === 'string' && PRODUCT_RULES.UNITS.includes(unit.toLowerCase());
}

export function isValidStatus(status) {
    return typeof status === 'string' && PRODUCT_RULES.STATUSES.includes(status.toLowerCase());
}

export function isValidVisibility(visibility) {
    return typeof visibility === 'string' && PRODUCT_RULES.VISIBILITY.includes(visibility.toLowerCase());
}

export function isValidDescription(description) {
    return typeof description === 'string' &&
        description.trim().length >= PRODUCT_RULES.DESCRIPTION_MIN_LENGTH &&
        description.trim().length <= PRODUCT_RULES.DESCRIPTION_MAX_LENGTH;
}

export function isValidBarcode(barcode) {
    if (!barcode || barcode.trim() === '') return true;
    return typeof barcode === 'string' &&
        barcode.trim().length >= PRODUCT_RULES.BARCODE_MIN_LENGTH &&
        barcode.trim().length <= PRODUCT_RULES.BARCODE_MAX_LENGTH &&
        PRODUCT_RULES.BARCODE_PATTERN.test(barcode.trim());
}

export function isValidManufacturer(manufacturer) {
    if (!manufacturer || manufacturer.trim() === '') return true;
    return typeof manufacturer === 'string' &&
        manufacturer.trim().length >= PRODUCT_RULES.MANUFACTURER_MIN_LENGTH &&
        manufacturer.trim().length <= PRODUCT_RULES.MANUFACTURER_MAX_LENGTH;
}

export function isValidCountryOfOrigin(country) {
    if (!country || country.trim() === '') return true;
    return typeof country === 'string' &&
        country.trim().length >= PRODUCT_RULES.COUNTRY_MIN_LENGTH &&
        country.trim().length <= PRODUCT_RULES.COUNTRY_MAX_LENGTH;
}

export function isValidTags(tags) {
    if (!tags || tags.length === 0) return true;
    return Array.isArray(tags) &&
        tags.every(tag => typeof tag === 'string' &&
            tag.trim().length >= PRODUCT_RULES.TAG_MIN_LENGTH &&
            tag.trim().length <= PRODUCT_RULES.TAG_MAX_LENGTH);
}

export function isValidImages(images) {
    if (!images || images.length === 0) return true;
    return Array.isArray(images) &&
        images.every(img => typeof img === 'string' && 
            (PRODUCT_RULES.URL_PATTERN.test(img.trim()) || 
             PRODUCT_RULES.IMAGE_URL_PATTERN.test(img.trim())));
}

export function isValidCategoryId(categoryId) {
    return typeof categoryId === 'string' && categoryId.trim().length > 0;
}

export function isValidDiscountPrice(discountPrice, originalPrice) {
    if (discountPrice === null || discountPrice === undefined) return true;
    return typeof discountPrice === 'number' &&
        discountPrice > 0 &&
        discountPrice < originalPrice;
}

// Comprehensive validation functions
export function validateProduct(data) {
    const errors = {};

    // Required fields
    if (!isValidProductName(data.name)) {
        errors.name = `Product name must be between ${PRODUCT_RULES.NAME_MIN_LENGTH} and ${PRODUCT_RULES.NAME_MAX_LENGTH} characters`;
    }

    if (!isValidSKU(data.sku)) {
        errors.sku = `SKU must be between ${PRODUCT_RULES.SKU_MIN_LENGTH} and ${PRODUCT_RULES.SKU_MAX_LENGTH} characters, alphanumeric with hyphens only`;
    }

    if (!isValidPrice(data.price)) {
        errors.price = `Price must be between ${PRODUCT_RULES.PRICE_MIN} and ${PRODUCT_RULES.PRICE_MAX}`;
    }

    if (!isValidStock(data.stock)) {
        errors.stock = 'Stock must be a non-negative integer';
    }

    if (!isValidMinStock(data.minStock)) {
        errors.minStock = 'Minimum stock must be a non-negative integer';
    }

    if (!isValidMaxStock(data.maxStock)) {
        errors.maxStock = 'Maximum stock must be a positive integer';
    }

    if (!isValidUnit(data.unit)) {
        errors.unit = `Unit must be one of: ${PRODUCT_RULES.UNITS.join(', ')}`;
    }

    if (!isValidStatus(data.status)) {
        errors.status = `Status must be one of: ${PRODUCT_RULES.STATUSES.join(', ')}`;
    }

    if (!isValidVisibility(data.visibility)) {
        errors.visibility = `Visibility must be one of: ${PRODUCT_RULES.VISIBILITY.join(', ')}`;
    }

    if (!isValidDescription(data.description)) {
        errors.description = `Description must be between ${PRODUCT_RULES.DESCRIPTION_MIN_LENGTH} and ${PRODUCT_RULES.DESCRIPTION_MAX_LENGTH} characters`;
    }

    if (!isValidCategoryId(data.categoryId)) {
        errors.categoryId = 'Category ID is required';
    }

    // Optional fields
    if (data.weight && !isValidWeight(data.weight)) {
        errors.weight = `Weight must be between ${PRODUCT_RULES.WEIGHT_MIN} and ${PRODUCT_RULES.WEIGHT_MAX}`;
    }

    if (data.barcode && !isValidBarcode(data.barcode)) {
        errors.barcode = `Barcode must be between ${PRODUCT_RULES.BARCODE_MIN_LENGTH} and ${PRODUCT_RULES.BARCODE_MAX_LENGTH} digits`;
    }

    if (data.manufacturer && !isValidManufacturer(data.manufacturer)) {
        errors.manufacturer = `Manufacturer must be between ${PRODUCT_RULES.MANUFACTURER_MIN_LENGTH} and ${PRODUCT_RULES.MANUFACTURER_MAX_LENGTH} characters`;
    }

    if (data.countryOfOrigin && !isValidCountryOfOrigin(data.countryOfOrigin)) {
        errors.countryOfOrigin = `Country of origin must be between ${PRODUCT_RULES.COUNTRY_MIN_LENGTH} and ${PRODUCT_RULES.COUNTRY_MAX_LENGTH} characters`;
    }

    if (data.tags && !isValidTags(data.tags)) {
        errors.tags = `Each tag must be between ${PRODUCT_RULES.TAG_MIN_LENGTH} and ${PRODUCT_RULES.TAG_MAX_LENGTH} characters`;
    }

    if (data.images && !isValidImages(data.images)) {
        errors.images = 'Each image must be a valid HTTP/HTTPS URL or data URL (data:image/format;base64,...)';
    }

    if (data.discountPrice && !isValidDiscountPrice(data.discountPrice, data.price)) {
        errors.discountPrice = 'Discount price must be less than original price';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
} 
