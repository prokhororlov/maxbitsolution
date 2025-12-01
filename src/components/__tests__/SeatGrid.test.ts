import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SeatGrid from '../SeatGrid.vue';

describe('SeatGrid', () => {
  const defaultProps = {
    rows: 3,
    seatsPerRow: 5,
    bookedSeats: [{ rowNumber: 1, seatNumber: 1 }],
    selectedSeats: [],
  };

  it('should render correct number of rows and seats', () => {
    const wrapper = mount(SeatGrid, { props: defaultProps });
    const rows = wrapper.findAll('.seat-row');
    expect(rows.length).toBe(3);
    
    const firstRowSeats = rows[0].findAll('.seat');
    expect(firstRowSeats.length).toBe(5);
  });

  it('should mark booked seats as disabled', () => {
    const wrapper = mount(SeatGrid, { props: defaultProps });
    const bookedSeat = wrapper.find('.seat.booked');
    expect(bookedSeat.exists()).toBe(true);
    expect(bookedSeat.attributes('disabled')).toBeDefined();
  });

  it('should allow selecting available seats', async () => {
    const wrapper = mount(SeatGrid, { props: defaultProps });
    const availableSeat = wrapper.find('.seat.available');
    
    await availableSeat.trigger('click');
    
    const selectedSeat = wrapper.find('.seat.selected');
    expect(selectedSeat.exists()).toBe(true);
  });

  it('should emit update:selectedSeats when seat is clicked', async () => {
    const wrapper = mount(SeatGrid, { props: defaultProps });
    const availableSeat = wrapper.find('.seat.available');
    
    await availableSeat.trigger('click');
    
    const emitted = wrapper.emitted('update:selectedSeats');
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[0]).toHaveLength(1);
  });

  it('should toggle seat selection', async () => {
    const wrapper = mount(SeatGrid, { props: defaultProps });
    const availableSeat = wrapper.find('.seat.available');
    
    await availableSeat.trigger('click');
    expect(wrapper.find('.seat.selected').exists()).toBe(true);
    
    await availableSeat.trigger('click');
    expect(wrapper.find('.seat.selected').exists()).toBe(false);
  });
});

