// components/book-card/book-card.js
const { formatDate, STATUS_MAP } = require('../../utils/util');

Component({
  properties: {
    book: {
      type: Object,
      value: {},
    },
  },

  observers: {
    'book'(book) {
      if (book) {
        const status = STATUS_MAP[book.status] || {};
        this.setData({
          statusLabel: status.label || '未知',
          statusClass: status.color || '',
          readDateStr: book.readDate ? formatDate(book.readDate) : '',
        });
      }
    },
  },

  data: {
    statusLabel: '',
    statusClass: '',
    readDateStr: '',
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { book: this.data.book });
    },
  },
});
