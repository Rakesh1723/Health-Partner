package com.healthpartner.users.repository;

import com.healthpartner.users.model.State;
import com.healthpartner.users.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<Users, Integer> {

    @Query("from Users where state=ACTIVE and id=:id")
    Optional<Users> findPartnerById(int id);

    @Query("from Users where state=ACTIVE")
    List<Users> findAllPartners();

    boolean existsByUserIdAndState(int userId, State state);

    boolean existsByEmailIdAndState(String emailId,State state);

    Optional<Users> findByEmailId(String userEmail);

    //leader board
    Optional<Users> findByUserName(String userName);
}
