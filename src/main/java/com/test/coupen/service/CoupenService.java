package com.test.coupen.service;

import com.test.coupen.CoupenRequestDto;
import com.test.coupen.CoupenUpdateRequestDto;
import com.test.coupen.entity.CoupenEntity;
import com.test.coupen.entity.DiscountType;
import com.test.coupen.entity.RangeEntity;
import com.test.coupen.repository.CoupenRepository;
import com.test.coupen.repository.RangeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Component
public class CoupenService {

    @Autowired
    CoupenRepository coupenRepository;

    @Autowired
    RangeRepository rangeRepository;

    public CoupenEntity saveCoupen(CoupenRequestDto requestDto){
        CoupenEntity coupen = new CoupenEntity();
        List<RangeEntity> ranges = getRangesCreate(requestDto.getRangeDiscounts(), coupen);
        coupen.setCoupenCode(requestDto.getCoupenCode());
        coupen.setDiscountType(requestDto.getDiscountType());
        if (Objects.equals(requestDto.getDiscountType(), DiscountType.FLAT)){
            coupen.setFixPercentage(requestDto.getFixPercentage());
            coupen.setMaxDiscount(requestDto.getMaxDiscount());
            coupen.setMinAmount(requestDto.getMinAmount());
        }
        coupenRepository.save(coupen);
        if(Objects.equals(requestDto.getDiscountType(), DiscountType.RANGE)){
            rangeRepository.saveAll(ranges);
            coupen.setRangeDiscounts(ranges);
        }
        return coupen;
    }

    public CoupenEntity updateCoupen(Long coupenId, CoupenUpdateRequestDto requestDto){
        CoupenEntity coupen = new CoupenEntity();
        coupen.setCoupenId(coupenId);
        coupen.setCoupenCode(requestDto.getCoupenCode());
        coupen.setDiscountType(requestDto.getDiscountType());
        if (Objects.equals(requestDto.getDiscountType(), DiscountType.FLAT)){
            coupen.setFixPercentage(requestDto.getFixPercentage());
            coupen.setMaxDiscount(requestDto.getMaxDiscount());
            coupen.setMinAmount(requestDto.getMinAmount());
        }
        if(Objects.equals(requestDto.getDiscountType(), DiscountType.RANGE)){
            List<RangeEntity> list = requestDto.getRangeDiscounts().stream()
                    .map(dto -> {
                        RangeEntity rangeEntity = dto.getId() == null ? new RangeEntity() : rangeRepository.findById(dto.getId()).orElse(new RangeEntity());
                        rangeEntity.setFrom(dto.getFrom());
                        rangeEntity.setTo(dto.getTo());
                        rangeEntity.setValue(dto.getValue());
                        rangeEntity.setCoupen(coupen);
                        return rangeRepository.save(rangeEntity);
                    }).toList();

            coupen.setRangeDiscounts(list);
        }

        return coupenRepository.save(coupen);
    }

    public boolean deleteCoupen(Long id){
        try {
            coupenRepository.deleteById(id);
            return true;
        } catch (Exception e){
            e.printStackTrace();
            return false;
        }
    }

    private List<RangeEntity> getRangesCreate(List<CoupenRequestDto.RangeDto> rangeDiscounts, CoupenEntity coupen) {
        if (Objects.isNull(rangeDiscounts)) {
            return List.of();
        }
        return rangeDiscounts.stream().map(rangeDto -> {
            RangeEntity rangeEntity = new RangeEntity();
            rangeEntity.setFrom(rangeDto.getFrom());
            rangeEntity.setTo(rangeDto.getTo());
            rangeEntity.setValue(rangeDto.getValue());
            rangeEntity.setCoupen(coupen);
            return rangeEntity;
        }).toList();
    }

    private List<RangeEntity> getRangesUpdate(List<CoupenUpdateRequestDto.RangeDto> rangeDiscounts, CoupenEntity coupen) {
        return rangeDiscounts.stream().map(rangeDto -> {
            RangeEntity rangeEntity = new RangeEntity();
            rangeEntity.setId(rangeDto.getId());
            rangeEntity.setFrom(rangeDto.getFrom());
            rangeEntity.setTo(rangeDto.getTo());
            rangeEntity.setValue(rangeDto.getValue());
            return rangeEntity;
        }).toList();
    }

    public CoupenEntity getCoupen(Long coupenId) {
        return coupenRepository.findById(coupenId).get();
    }

    public List<CoupenEntity> getCoupens() {
        return coupenRepository.findAll();
    }

    public Optional<CoupenEntity> getCoupenByCoupenCode(String coupenName) {
        return coupenRepository.findByCoupenCode(coupenName.toLowerCase()).stream().findFirst();
    }
}
