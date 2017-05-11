package com.amazonaws.samples.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.amazonaws.samples.service.CompareFaces;

import java.io.IOException;

@RestController
@RequestMapping(path="/compare")
public class CompareFacesController {
	
	@RequestMapping(path="/index", method = RequestMethod.POST)
	public String index( @RequestParam("file1") MultipartFile file1,  @RequestParam("file2") MultipartFile file2 ) throws IOException {
		return CompareFaces.compare(file1, file2);
	}


}
