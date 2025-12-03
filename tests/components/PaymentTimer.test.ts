import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PaymentTimer from '@/components/PaymentTimer.vue';

describe('PaymentTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display remaining time correctly', () => {
    const bookedAt = new Date(Date.now() - 60000).toISOString();
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        paymentTimeSeconds: 180,
      },
    });

    expect(wrapper.text()).toContain('Осталось');
  });

  it('should update timer every second', async () => {
    const bookedAt = new Date(Date.now() - 60000).toISOString();
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        paymentTimeSeconds: 180,
      },
    });

    const initialText = wrapper.text();
    
    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();
    
    const updatedText = wrapper.text();
    expect(updatedText).not.toBe(initialText);
  });

  it('should format time as MM:SS', () => {
    const bookedAt = new Date(Date.now() - 60000).toISOString();
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        paymentTimeSeconds: 180,
      },
    });

    const text = wrapper.text();
    expect(text).toMatch(/\d+:\d{2}/);
  });
});

