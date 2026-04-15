const PDFDocument = require("pdfkit");

const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on("error", reject);

    doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").text(`Order ID: ${order.orderId}`, { align: "center" });
    doc.fontSize(9).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: "center" });
    doc.moveDown();

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Shipping Address", { underline: true });
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(order.shippingAddress.fullName)
      .text(order.shippingAddress.street)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`)
      .text(`Phone: ${order.shippingAddress.phone}`);
    doc.moveDown();

    doc.fontSize(12).font("Helvetica-Bold").text("Order Items", { underline: true });
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    const columns = {
      name: 50,
      price: 350,
      qty: 430,
      subtotal: 480
    };

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Product", columns.name)
      .text("Price", columns.price)
      .text("Qty", columns.qty)
      .text("Subtotal", columns.subtotal, doc.y - 20);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);

    order.items.forEach((item) => {
      doc
        .font("Helvetica")
        .fontSize(9)
        .text(item.name, columns.name, doc.y)
        .text(`₹${item.price}`, columns.price, doc.y - 20)
        .text(item.quantity, columns.qty, doc.y - 20)
        .text(`₹${item.subtotal}`, columns.subtotal, doc.y - 20);
      doc.moveDown(1.5);
    });

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    const rightColumn = 380;
    doc
      .font("Helvetica")
      .fontSize(10)
      .text("Subtotal:", rightColumn, doc.y)
      .text(`₹${order.pricing.subtotal}`, 480, doc.y - 20);

    doc.moveDown();
    doc
      .text("Tax (GST):", rightColumn, doc.y)
      .text(`₹${order.pricing.tax}`, 480, doc.y - 20);

    doc.moveDown();
    doc
      .text("Shipping:", rightColumn, doc.y)
      .text(`₹${order.pricing.shippingCharge}`, 480, doc.y - 20);

    if (order.pricing.discountAmount > 0) {
      doc.moveDown();
      doc
        .font("Helvetica-Bold")
        .text(`Discount (${order.pricing.couponCode}):`, rightColumn, doc.y)
        .text(`-₹${order.pricing.discountAmount}`, 480, doc.y - 20);
    }

    doc.moveDown();
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Total:", rightColumn, doc.y)
      .text(`₹${order.pricing.total}`, 480, doc.y - 20);

    doc.moveDown(2);
    doc.fontSize(9).text("Thank you for your purchase!", { align: "center" });

    doc.end();
  });
};

module.exports = { generateInvoicePDF };
