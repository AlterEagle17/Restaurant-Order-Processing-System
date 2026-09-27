package com.restaurant.backend.common;

import org.springframework.data.domain.PageRequest;

public final class PageRequests {
	private PageRequests() { }

	public static PageRequest of(int page, int size) {
		if (page < 0) throw new IllegalArgumentException("page must be zero or greater");
		if (size < 1) throw new IllegalArgumentException("size must be at least one");
		return PageRequest.of(page, Math.min(size, 100));
	}
}