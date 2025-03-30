package com.test.coupen.resources;

import com.test.coupen.CoupenRequestDto;
import com.test.coupen.CoupenRequestDto.RangeDto;

import com.test.coupen.CoupenUpdateRequestDto;
import com.test.coupen.entity.CoupenEntity;
import com.test.coupen.entity.DiscountType;
import com.test.coupen.service.CoupenService;
import com.test.coupen.service.FlightService;
import com.test.coupen.service.ResponseDto;
import jakarta.validation.Valid;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@RestController
@CrossOrigin(origins = "*")
public class CoupenController {

    @Autowired
    CoupenService coupenService;

    @Autowired
    FlightService flightService;

    @GetMapping(value = "/coupen")
    public List<CoupenEntity> getCoupens() {
        return coupenService.getCoupens();
    }

    @PostMapping(value = "/coupen", consumes = MediaType.APPLICATION_JSON_VALUE,produces = MediaType.APPLICATION_JSON_VALUE)
    public CoupenEntity postCoupen(@RequestBody @Valid CoupenRequestDto requestDto) throws BadRequestException {
        if(Objects.equals(requestDto.getDiscountType(), DiscountType.RANGE)){
            validateRanges(requestDto.getRangeDiscounts());
        }
        return coupenService.saveCoupen(requestDto);
    }

    @PutMapping(value = "/coupen/{id}", consumes = MediaType.APPLICATION_JSON_VALUE,produces = MediaType.APPLICATION_JSON_VALUE)
    public CoupenEntity putCoupen(@PathVariable("id") Long coupenId, @RequestBody @Valid CoupenUpdateRequestDto requestDto) throws BadRequestException {
        if(Objects.equals(requestDto.getDiscountType(), DiscountType.RANGE)){
            validateRangesUpdate(requestDto.getRangeDiscounts());
        }
        return coupenService.updateCoupen(coupenId, requestDto);
    }

    @GetMapping(value = "/coupen/{id}")
    public CoupenEntity getCoupen(@PathVariable("id") Long coupenId) {
        return coupenService.getCoupen(coupenId);
    }

    @DeleteMapping(value = "/coupen/{id}")
    public boolean deleteCoupen(@PathVariable("id") Long coupenId){
        return coupenService.deleteCoupen(coupenId);
    }

    @GetMapping(value = "/find/{from}/{to}/{date}/{adult}/{child}/{intfrants}/{coupon}")
    public List<ResponseDto> getresponseDto(@PathVariable("from") String from,
                                            @PathVariable("to") String to,
                                            @PathVariable("date") String date,
                                            @PathVariable("adult") int adult,
                                            @PathVariable("child") int child,
                                            @PathVariable("intfrants") int intfrant,
                                            @PathVariable(value = "coupon", required = false) String coupen
    ) throws IOException {
        return flightService.getData("","", from,to,date,adult,child,intfrant,coupen);
    }

    @GetMapping(value = "/search/{key}")
    public String getSearchResult(@PathVariable("key") String keyword) throws IOException {
        return flightService.getFlightResult(keyword);
    }

    public static void validateRanges(List<RangeDto> ranges) throws BadRequestException {
        if (ranges == null || ranges.isEmpty()) {
            throw new BadRequestException("Range list cannot be null or empty.");
        }

        for (RangeDto range : ranges) {
            if (range.getFrom() > range.getTo()) {
                throw new BadRequestException("Invalid range: start must be less than or equal to end. Found: " + range);
            }
        }

        // Sort the ranges by start value
        ranges.sort((r1, r2) -> Long.compare(r1.getFrom(), r2.getTo()));

        if (ranges.get(0).getFrom() > 0) {
            RangeDto zeroRange = new RangeDto(0L, ranges.get(0).getFrom() - 1, 0L);
            List<RangeDto> updatedRanges = new ArrayList<>();
            updatedRanges.add(zeroRange);
            updatedRanges.addAll(ranges);
            ranges = updatedRanges;
        }

        // Check for overlapping or duplicate ranges
        for (int i = 1; i < ranges.size(); i++) {
            RangeDto prev = ranges.get(i - 1);
            RangeDto current = ranges.get(i);

            if (current.getFrom() <= prev.getTo()) {
                throw new BadRequestException("Overlapping or duplicate ranges found: " + prev + " and " + current);
            }
        }
    }

    public static void validateRangesUpdate(List<CoupenUpdateRequestDto.RangeDto> ranges) throws BadRequestException {
        if (ranges == null || ranges.isEmpty()) {
            throw new BadRequestException("Range list cannot be null or empty.");
        }

        for (CoupenUpdateRequestDto.RangeDto range : ranges) {
            if (range.getFrom() > range.getTo()) {
                throw new BadRequestException("Invalid range: start must be less than or equal to end. Found: " + range);
            }
        }

        // Sort the ranges by start value
        ranges.sort((r1, r2) -> Long.compare(r1.getFrom(), r2.getTo()));

        if (ranges.get(0).getFrom() > 0) {
            CoupenUpdateRequestDto.RangeDto zeroRange = new CoupenUpdateRequestDto.RangeDto(null, 0L, ranges.get(0).getFrom() - 1, 0L);
            List<CoupenUpdateRequestDto.RangeDto> updatedRanges = new ArrayList<>();
            updatedRanges.add(zeroRange);
            updatedRanges.addAll(ranges);
            ranges = updatedRanges;
        }

        // Check for overlapping or duplicate ranges
        for (int i = 1; i < ranges.size(); i++) {
            CoupenUpdateRequestDto.RangeDto prev = ranges.get(i - 1);
            CoupenUpdateRequestDto.RangeDto current = ranges.get(i);

            if (current.getFrom() <= prev.getTo()) {
                throw new BadRequestException("Overlapping or duplicate ranges found: " + prev + " and " + current);
            }
        }
    }
}
